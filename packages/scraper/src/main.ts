import { chromium, Browser, Page } from 'playwright';
import { HackerNewsSource } from './sources/hackernews.source';
// import { RedditSource } from './sources/reddit.source'; // Example for the future

async function main() {
	console.log('🚀 Starting The Pain Prism scraper...');

	// Define all the sources we want to scrape. Just hacker news for now
	const sourcesToScrape = [HackerNewsSource];

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		userAgent:
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	});
	const page = await context.newPage();

	try {
		for (const source of sourcesToScrape) {
			console.log(`\n\n--- Scraping Source: ${source.name} ---`);
			const postUrls = await source.collectPostUrls(page);
			console.log(
				`[${source.name}] Found ${postUrls.size} unique posts to process.`
			);

			for (const url of Array.from(postUrls)) {
				await source.processPost(page, url);
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

(async () => {
	await main();
})();
