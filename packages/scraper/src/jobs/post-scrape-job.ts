/**
 * Runs all post-scrape steps in order: score → build bundles → analyze bundles.
 * Uses a lock file so only one post-scrape runs at a time; skips if scrape is running.
 * For fewer points of failure, run each step separately (see README).
 */
import { tryAcquireLock, releaseLock, isLockActive } from './lock.js';
import { runScoreJob } from './score-job.js';
import { runBundleBuilderJob } from './bundle-builder-job.js';
import { runBundleAnalyzerJob } from './bundle-analyzer-job.js';

const POST_SCRAPE_LOCK = 'post-scrape';
const SCRAPE_LOCK = 'scraper';

async function main() {
	if (isLockActive(SCRAPE_LOCK)) {
		console.log('[Post-Scrape] Scraper is running; skipping so we don’t run on partial data.');
		process.exit(0);
	}
	if (!tryAcquireLock(POST_SCRAPE_LOCK)) {
		console.log('[Post-Scrape] Another post-scrape run is in progress; skipping.');
		process.exit(0);
	}
	try {
		console.log('[Post-Scrape] Step 1/3: score...');
		await runScoreJob();
		console.log('[Post-Scrape] Step 2/3: build bundles...');
		await runBundleBuilderJob();
		console.log('[Post-Scrape] Step 3/3: analyze bundles...');
		await runBundleAnalyzerJob();
		console.log('[Post-Scrape] All steps done.');
	} finally {
		releaseLock(POST_SCRAPE_LOCK);
	}
}

main().then(() => process.exit(0)).catch((e) => {
	console.error(e);
	console.error('[Post-Scrape] Failed. Re-run from the failed step: score, bundles:build, or bundles:analyze.');
	releaseLock(POST_SCRAPE_LOCK);
	process.exit(1);
});
