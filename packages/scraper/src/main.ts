import { chromium } from 'playwright';
import { HackerNewsSource } from './sources/hackernews.source.js';
import { ScraperSource } from './types.js';
import { CommentProcessingService } from './pipeline/pipeline.service.js';

async function main() {
	console.log('🚀 Starting The Pain Prism scraper...');

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({
		// TODO - add this back
		/* ... */
	});
	const page = await context.newPage();

	// The source list is clean and simple.
	const sourcesToScrape: ScraperSource[] = [
		// A source is given an orchestrator which is what handles the processing steps
		new HackerNewsSource(),
		// new RedditSource(), // Adding a new source is now trivial.
	];

	try {
		for (const source of sourcesToScrape) {
			console.log(`\n\n--- Scraping Source: ${source.name} ---`);
			const postUrls = await source.collectPostUrls(page);
			console.log(
				`[${source.name}] Found ${postUrls.size} unique posts to process.`
			);

			for (const url of Array.from(postUrls)) {
				// A new pipeline (and a new cache) is created for each post.
				const pipeline = new CommentProcessingService();
				// The scraper is given the pipeline's processing function for this single post.
				await source.processPost(
					page,
					url,
					pipeline.processRawCommentPipeline
				);
			}
		}
	} catch (error) {
		console.error(
			'❌ A fatal error occurred during the main scraping process:',
			error
		);
	} finally {
		await browser.close();
		console.log('\n\n✅ Scraper finished. Browser closed.');
	}
}

main().catch(console.error);
