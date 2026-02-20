import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env before any other imports that use process.env
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Surface real errors; Node often hides non-Error throws
process.on('uncaughtException', (err) => {
	console.error('uncaughtException:', err);
	process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
	console.error('unhandledRejection:', reason, promise);
	process.exit(1);
});

async function main() {
	// Dynamic import so env + handlers are in place before playwright/pipeline load
	const { chromium } = await import('playwright');
	const { HackerNewsSource } = await import('./sources/hackernews.source.js');
	const { CommentProcessingService } = await import(
		'./pipeline/pipeline.service.js'
	);

	console.log('🚀 Starting The Pain Prism scraper...');

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({
		// TODO - add this back
		/* ... */
	});
	const page = await context.newPage();

	const sourcesToScrape = [new HackerNewsSource()];

	const { tryAcquireLock, releaseLock } = await import('./jobs/lock.js');
	if (!tryAcquireLock('scraper')) {
		console.log('Another scraper run is in progress; exiting.');
		await browser.close();
		return;
	}

	let hadError = false;
	try {
		for (const source of sourcesToScrape) {
			console.log(`\n\n--- Scraping Source: ${source.name} ---`);
			const postUrls = await source.collectPostUrls(page);
			const urlList = Array.from(postUrls);
			console.log(
				`[${source.name}] Found ${urlList.length} unique posts to process.\n`
			);

			for (let i = 0; i < urlList.length; i++) {
				const url = urlList[i];
				console.log(`\n[Post ${i + 1}/${urlList.length}] ${url}`);
				const pipeline = new CommentProcessingService();
				await source.processPost(
					page,
					url,
					pipeline.processRawCommentPipeline
				);
			}
		}
	} catch (error) {
		hadError = true;
		console.error(
			'❌ A fatal error occurred during the main scraping process:',
			error
		);
	} finally {
		releaseLock('scraper');
		await browser.close();
		console.log(hadError ? '\n\n⚠️ Scraper stopped (see error above). Browser closed.' : '\n\n✅ Scraper finished. Browser closed.');
	}
}

main().catch(console.error);
