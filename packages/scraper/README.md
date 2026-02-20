# Pain Prism — Scraper

Scrapes forums (HN, etc.), stores raw posts and comments, then scores them and builds **bundles** (post + curated comments) for bundle-level analysis. The app shows bundle synopses, not per-comment insights.

## Environment

In `packages/scraper/.env`:

- **DATABASE_URL** — Postgres connection string (same DB as backend).
- **OPENAI_API_KEY** — Used by the score job and bundle analyzer.

## Pipeline overview

```
┌─────────────┐     ┌──────────────────────────────────────────────────────────┐
│   SCRAPE    │     │  Post-scrape steps (run after scrape finishes):          │
│             │     │  1. score        — LLM usefulness/generality on comments |
│  Raw only:  │ ──► │  2. bundles:build — One bundle per post (curated set)    │
│  • posts    │     │  3. bundles:analyze — One LLM insight per bundle         │
│  • comments │     └──────────────────────────────────────────────────────────┘
└─────────────┘
```

- **Scrape** does not run any analysis. It only persists posts and comments.
- **Post-scrape** score → build bundles → analyze. You can run the full chain or each step separately (see below).

## Commands

From repo root (or from `packages/scraper` with `pnpm <script>`):

| What | Command |
|------|---------|
| Run scraper (raw posts + comments) | `pnpm --filter scraper scrape` |
| **Run all post-scrape steps** (score → build → analyze) | `pnpm --filter scraper post-scrape` |
| **Score only** — usefulness/generality for unscored posts & comments | `pnpm --filter scraper score` |
| **Build bundles only** — one bundle per post (curated comments) | `pnpm --filter scraper bundles:build` |
| **Analyze bundles only** — LLM synopsis for bundles that don’t have one yet | `pnpm --filter scraper bundles:analyze` |

Running the three post-scrape steps **separately** reduces single-run failure: if one step fails (e.g. API limit, DB timeout), you can fix and re-run from that step instead of redoing everything. Order matters: run `score` before `bundles:build`, and `bundles:build` before `bundles:analyze`.

## Typical workflow

1. **Scrape:** `pnpm --filter scraper scrape`. Let it run, then stop (Ctrl+C) when done.
2. **Post-scrape** — either:
   - **All at once:** `pnpm --filter scraper post-scrape` (score → build → analyze).
   - **Step by step:** `pnpm --filter scraper score`, then `pnpm --filter scraper bundles:build`, then `pnpm --filter scraper bundles:analyze`. Use this if you want to retry or pause between steps.

## Scheduled tasks (cron)

Recommended way to keep the pipeline fed and insights growing:

| Task | What to run | Suggested interval | Notes |
|------|-------------|--------------------|--------|
| **Scrape** | `pnpm --filter scraper scrape` | e.g. every 6–12 h or daily | Ingests new posts + comments. Let it finish before relying on post-scrape for that data. |
| **Post-scrape** | `pnpm --filter scraper post-scrape` | Every 10–15 min | Runs score (all unscored) → build bundles → analyze up to `BUNDLE_ANALYZER_BATCH_LIMIT` bundles per run. Uses `SCORE_DELAY_MS` and `BUNDLE_ANALYZER_DELAY_MS` between API calls to avoid rate limits. |

**Order:** Scrape can run on its own schedule. Post-scrape should run on a fixed interval (e.g. every 15 min). Each post-scrape run will: clear any unscored backlog (in chunks), refresh stale bundles (≥20 new comments), and analyze up to 100 bundles that don’t have a synopsis yet. So over time you stay close to the tail without one huge run.

**Locks:** Post-scrape uses file-based locks in the scraper package dir (`.post-scrape.lock`, `.scraper.lock`). Only one post-scrape runs at a time; if a run is already in progress, the next one exits without doing work. Post-scrape also skips if the scraper is running (so it doesn't process partial data). Scrape sets `.scraper.lock` while it runs. Locks older than 1 hour are treated as stale (crashed run) and overwritten.

Where they're invoked: `src/jobs/lock.ts` defines `tryAcquireLock`, `releaseLock`, `isLockActive`. The scraper (`src/main.ts`) acquires the `scraper` lock after the browser is up and releases it in `finally` before closing the browser. The post-scrape entrypoint (`src/jobs/post-scrape-job.ts`) checks `isLockActive('scraper')` and exits if set; then acquires the `post-scrape` lock with `tryAcquireLock`, runs the three steps, and releases in `finally` (and on catch).

## Database

- **Schema:** `src/db/schema.ts`. Tables include `posts`, `comments`, `bundles`, `bundle_comments`, plus legacy `insights` (unused).
- **Migrations:** After changing the schema, from repo root:
  - `pnpm --filter scraper db:generate` — generate migration from schema
  - `pnpm --filter scraper db:migrate` — apply pending migrations

Migrations are in `packages/scraper/drizzle/`. Migrate script reads `DATABASE_URL` from `.env`.

## Tuning

- **Constants:** `src/constants.ts`
  - Bundle size, depth, score thresholds (e.g. `MIN_COMMENT_USEFULNESS_FOR_BUNDLE`, `BUNDLE_ANALYZER_MEDIAN_*`).
  - When to rebundle: `MIN_NEW_COMMENTS_TO_REBUNDLE` (default 20).
  - **Scheduled runs:** The score job defaults to 50 posts and 50 comments per run (same idea as the bundle analyzer batch limit). Set `SCORE_MAX_POSTS_PER_RUN` / `SCORE_MAX_COMMENTS_PER_RUN` to 0 to process all unscored in one run.
- **Bundle analyzer prompt:** `src/analysis/analyze-bundle.ts` — system prompt for “one pain/yearning per thread,” avoid niche/incumbent/trivial.
- **Usefulness/generality scorer:** `src/analysis/score-usefulness.ts` — defines what gets high vs low scores.

## Notes

- The **insights** table is decommissioned: nothing writes to it; the app only shows bundles. Old rows are legacy.
- One **bundle per post** = post + top-level comments + up to N levels of replies, score-filtered and capped. Not topic-split (structural only).
