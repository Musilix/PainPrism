/**
 * Central constants for the scraper service. Sections:
 * - Keywords: pre-filtering lists (pain/yearning) for legacy/optional use
 * - Taxonomy: allowed tags and audience types (bundle analyzer output)
 * - Source / listing: how many pages we scrape per section (e.g. HN)
 * - Bundle building: size, depth, rebundle threshold, comment score filters
 * - Bundle analyzer: which bundles to analyze, script length, rate limit
 * - Score job: batch size, rate limit, text length, LLM temperature
 */

// ========== Keywords (pre-filtering) ==========
const PAIN_POINT_KEYWORDS = [
	// --- Direct Frustration & Strong Emotion ---
	'frustrating',
	'annoying',
	'infuriating',
	'i hate',
	'terrible',
	'awful',
	'horrible',
	'nightmare',
	'headache',
	'sucks',
	'unacceptable',
	'disaster',
	'despise',
	'detest',
	'loathe',
	'painful',
	'a pain',
	'the worst part',

	// --- Problem Identification & Bugs ---
	'the problem is',
	'my issue is',
	'the challenge is',
	'the difficulty is',
	'the main drawback is',
	'biggest complaint',
	'bug with',
	'issue with',
	'glitch',
	'error',
	'crashed',
	'fails to',
	'doesn’t work',
	'is broken',
	'faulty',
	'defective',
	'bug report',

	// --- Friction & Inefficiency ---
	'slow',
	'clunky',
	'sluggish',
	'laggy',
	'difficult to',
	'unintuitive',
	'confusing',
	'hard to use',
	'steep learning curve',
	'takes forever',
	'waste of time',
	'tedious',
	'manual process',
	'workaround',
	'i have to manually',
	'too complicated',
	'over-engineered',
	'bloated',
	'cumbersome',
	'bottleneck',

	// --- Negative Outcomes & Risks ---
	'data loss',
	'security risk',
	'vulnerability',
	'insecure',
	'unreliable',
	'inconsistent',
	'unstable',
	'breaks down',
	'vendor lock-in',
	'compliance issue',

	// --- Usability & Design Flaws ---
	'bad ui',
	'bad ux',
	'ugly interface',
	'poor design',
	'counter-intuitive',
	'hard to navigate',
	'messy',
	'cluttered',
	'hidden feature',
	'hard to find',

	// --- Missing/Poor Documentation & Support ---
	'poor documentation',
	'docs are wrong',
	'no documentation',
	'unclear instructions',
	'confusing docs',
	'lack of examples',
	'no support',
	'bad support',
	'outdated docs',

	// --- Comparative Complaints ---
	'better than', // e.g., "X is better than Y because Y is so slow"
	'is so much better',
	'unlike tool y',
	'switched from',
	'moved away from',
	'migrated from',
	'dropped it for',
	'used to use',

	// --- Cost & Pricing ---
	'too expensive',
	'overpriced',
	'pricing is',
	'hidden fees',
	'subscription fatigue',
	'paywall',
	'nickel and dime',
	'enterprise pricing',
	'can\'t afford',
	'price hike',
	'billing nightmare',

	// --- Scaling & Growth ---
	'doesn\'t scale',
	'scaling issues',
	'outgrew',
	'hit the limit',
	'rate limit',
	'quota',
	'can\'t handle',
	'falls over at',

	// --- Discovery & Findability ---
	'hard to discover',
	'can\'t find',
	'no search',
	'search is broken',
	'discoverability',
	'buried in',
	'impossible to find',

	// --- Onboarding & Activation ---
	'onboarding is',
	'never got past',
	'gave up during signup',
	'activation',
	'too many steps',
	'can\'t get started',

	// --- Mobile & Cross-Platform ---
	'mobile app is',
	'no mobile',
	'desktop only',
	'doesn\'t sync',
	'sync is broken',
	'offline doesn\'t work',
	'no offline',
	'platform lock-in',

	// --- Privacy & Trust ---
	'privacy concern',
	'tracking',
	'data harvesting',
	'can\'t delete my data',
	'gdpr',
	'creepy',
	'trust issue',

	// --- Legacy & Migration ---
	'legacy',
	'deprecated',
	'no migration path',
	'stuck on',
	'can\'t migrate',
	'vendor lock-in',
	'export is',
	'data portability',

	// --- Support & Community ---
	'no community',
	'dead project',
	'abandoned',
	'no updates',
	'terrible support',
	'response time',
	'can\'t get help',

	// --- Localization & Accessibility ---
	'no translation',
	'english only',
	'accessibility',
	'not accessible',
	'keyboard nav',
	'screen reader',
];

const PRODUCT_YEARNING_KEYWORDS = [
	// --- Direct Wishes & Desires ---
	'i wish',
	'if only',
	'i would love',
	'i want a',
	'what i really want is',
	'all i want is',
	'desperately need',
	'dream feature',
	'my kingdom for',
	'really wish',

	// --- Solution Proposals & Hypotheticals ---
	'what if',
	'imagine if',
	"wouldn't it be great if",
	'they should add',
	'a feature for',
	'a way to',
	'needs a way to',
	'could be improved by',
	'potential for',
	'it would be cool if',
	'a simple toggle for',
	'add support for',

	// --- Willingness to Pay ---
	'would pay for',
	'would gladly pay',
	'take my money',
	'shut up and take my money',
	'i would pay good money for',
	'instant buy',
	'would subscribe for',
	'would pay a premium for',
	'name your price',

	// --- Market Gap Identification ---
	'needs a',
	"there's no good tool for",
	"why doesn't xyz exist",
	'someone should build',
	'someone needs to make',
	'the missing piece is',
	'huge opportunity for',
	'surprised no one has built',
	'alternative to',
	'competitor to',
	'a self-hosted',
	'an open-source',
	'a better alternative',

	// --- Direct Ideas & Requests ---
	'idea for',
	'feature request',
	'product idea',
	'a simple app that',
	'a tool that',
	'a service that',
	'a plugin for',
	'an extension for',

	// --- Integration & Compatibility Needs ---
	'integrate with',
	'api for',
	'connect to',
	'works with',
	'plugin system',
	'support for',
	'compatible with',

	// --- Simplification Requests ---
	'a simpler',
	'a lightweight',
	'a minimal',
	'just the essentials',
	'without the bloat',
	'a stripped-down version',
	'a focused tool',

	// --- Privacy & Control ---
	'privacy-first',
	'self-hosted option',
	'local-first',
	'own my data',
	'no tracking',
	'offline-first',
	'end-to-end encrypted',

	// --- Automation & Workflow ---
	'automate',
	'no-code way to',
	'zapier for',
	'automation for',
	'workflow that',
	'connects',
	'trigger when',

	// --- Discovery & Curation ---
	'a directory of',
	'a list of',
	'curated',
	'recommend',
	'discover',
	'find the best',
	'comparison of',

	// --- Regional & Niche ---
	'for [country]',
	'local to',
	'built for',
	'specifically for',
	'aimed at',
	'targeting',
	'niche for',

	// --- Interop & Standards ---
	'open standard',
	'interoperable',
	'export to',
	'import from',
	'works with everything',
	'plugin ecosystem',

	// --- Indie & Solo ---
	'indie',
	'solo founder',
	'bootstrap',
	'side project',
	'one-person',
	'small team',
];

// Combine all keywords into a single array for the regex.
// Using a Set to automatically handle any duplicates, then converting back to an array.
export const INSIGHT_KEYWORDS = [
	...new Set([...PAIN_POINT_KEYWORDS, ...PRODUCT_YEARNING_KEYWORDS]),
];

// ========== Taxonomy (tags & audience) ==========
/** Canonical list of allowed tags for bundle analyzer output. */
export const ALLOWED_TAGS = [
	// High-Level Categories
	'saas',
	'ai',
	'developer tool',
	'open source',
	'api',
	'mobile app',
	'web app',
	'e-commerce',
	'fintech',
	'healthtech',
	'edtech',
	'gamedev',

	// Technical Concepts
	'database',
	'backend',
	'frontend',
	'devops',
	'ci/cd',
	'testing',
	'security',
	'authentication',
	'cloud',
	'hosting',
	'performance',
	'documentation',
	'local development',
	'networking',
	'cli',

	// Business & Workflow
	'productivity',
	'project management',
	'marketing',
	'sales',
	'hiring',
	'communication',
	'collaboration',
	'customer support',
	'analytics',

	// User Experience
	'ux',
	'ui',
	'design',
	'onboarding',
	'accessibility',

	// Data & ML
	'data science',
	'machine learning',
	'data engineering',
	'data visualization',
	'ETL',
	'llm',
	'vector database',

	// Hardware & Manufacturing
	'iot',
	'robotics',
	'3d printing',
	'hardware',
	'manufacturing',
	'embedded systems',

	// Niche & Emerging Tech
	'aerospace',
	'blockchain',
	'crypto',
	'vr',
	'ar',
	'quantum computing',
	'bio-tech',
	'clean-tech',
	'legal-tech',
	'insurtech',
	'proptech',
	'logistics',
	'supply chain',
	'agtech',
	'creator economy',
	'streaming',
	'esports',

	// Regions, Compliance & Trust
	'privacy',
	'compliance',
	'gdpr',
	'localization',
	'i18n',
	'accessibility',
	'a11y',
	'sustainability',
	'ethics',

	// Workflow & Operations
	'hr',
	'recruiting',
	'payments',
	'billing',
	'invoicing',
	'notifications',
	'search',
	'content moderation',
	'community',
	'forums',

	// Cross-cutting
	'offline-first',
	'no-code',
	'low-code',
	'indie',
	'bootstrap',
];

/** Single source of truth for audience classification (bundle analyzer output). */
export const AUDIENCE_TYPES = [
	// Broad consumer-facing products and services.
	'general_consumer',
	// Tools and services for SMBs, startups, and solo entrepreneurs.
	'small_business',
	// For designers, artists, writers, musicians, videographers.
	'creative_professional',
	// For large organizations; scaling, compliance, enterprise software.
	'enterprise',
	// Mid-market: between SMB and enterprise.
	'mid_market',
	// For developers, sysadmins, and engineers with deep technical needs.
	'niche_technical',
	// Indie devs, solo founders, side-project builders.
	'indie_developer',
	// Academics, scientists, university researchers.
	'academic_researcher',
	// Students and self-learners.
	'student_learner',
	// Government, non-profits, civic tech.
	'government_public_sector',
	// Healthcare practitioners, clinicians, medical.
	'healthcare_professional',
	// Legal professionals, law firms.
	'legal_professional',
	// Educators, teachers, trainers.
	'educator',
	// Freelancers, contractors, gig workers.
	'freelancer',
	// Operations, logistics, supply chain.
	'operations',
	// Content creators, streamers, influencers (creator economy).
	'content_creator',
	// Hobbyists, makers, tinkerers.
	'hobbyist_maker',
	// Non-technical / no-code / business users.
	'non_technical',
];

// ========== Source / listing ==========
/** How many listing pages to follow per HN section (1 = first page only; "More" is followed when > 1). */
export const PAGES_TO_SCRAPE_PER_SECTION = 1;

// ========== Bundle building ==========
/**
 * Max comments per bundle (total cap after depth + score filter).
 * Bundle = post + top-level comments + up to MAX_DEPTH_PER_BRANCH levels deep, score-filtered.
 * (Ideal would be topic-context separation per bundle; this is a structural compromise.)
 */
export const MAX_COMMENTS_PER_BUNDLE = 150;
/** Only rebundle when the post has at least this many NEW comments since the bundle was built. */
export const MIN_NEW_COMMENTS_TO_REBUNDLE = 20;
/** Depth of replies to include per top-level comment (0 = top-level only, 1 = + direct replies, 2 = + one more level). */
export const MAX_DEPTH_PER_BRANCH = 2;
/** Min usefulness (0–1) for a comment to be included in a bundle; null/unscored comments are excluded. */
export const MIN_COMMENT_USEFULNESS_FOR_BUNDLE = 0.35;
/** Min generality (0–1) for a comment to be included in a bundle; null/unscored comments are excluded. */
export const MIN_COMMENT_GENERALITY_FOR_BUNDLE = 0.35;

// ========== Bundle analyzer ==========
/** Min median usefulness (0–1) for a bundle to be sent to the analyzer. */
export const BUNDLE_ANALYZER_MEDIAN_USEFULNESS_MIN = 0.3;
/** Min median generality (0–1) for a bundle to be sent to the analyzer. */
export const BUNDLE_ANALYZER_MEDIAN_GENERALITY_MIN = 0.3;
/** How many bundles to analyze per analyzer job run. Used with BUNDLE_ANALYZER_DELAY_MS to avoid rate limits. */
export const BUNDLE_ANALYZER_BATCH_LIMIT = 100;
/** Max characters of conversation script sent to the bundle analyzer LLM (truncated if longer). */
export const BUNDLE_ANALYZER_MAX_SCRIPT_CHARS = 12000;
/** Delay in ms between bundle analyzer API calls (rate limiting). */
export const BUNDLE_ANALYZER_DELAY_MS = 1000;

// ========== Score job ==========
/** Chunk size for DB fetches in the score job (memory). Job runs until all unscored posts then all unscored comments are scored; each query fetches this many at a time so we don’t load the whole backlog into memory. */
export const SCORE_BATCH_SIZE = 100;
/** Max posts to score per run; 0 = no limit. Default 50 for bounded scheduled runs (like bundle analyzer). */
export const SCORE_MAX_POSTS_PER_RUN = 50;
/** Max comments to score per run; 0 = no limit. Default 50 for bounded scheduled runs. */
export const SCORE_MAX_COMMENTS_PER_RUN = 50;
/** Delay in ms between score job API calls (rate limiting). */
export const SCORE_DELAY_MS = 1000;
/** Max characters of text sent to the usefulness/generality scorer (truncated if longer). */
export const SCORE_MAX_TEXT_CHARS = 4000;
/** LLM temperature for the scorer (0–1; lower = more deterministic). */
export const SCORER_TEMPERATURE = 0.2;