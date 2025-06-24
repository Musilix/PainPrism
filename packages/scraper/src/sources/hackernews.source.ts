import { Page } from 'playwright';
import { insertPost } from '../storage/db';

const HN_BASE_URL = 'https://news.ycombinator.com/';
const PAGES_TO_SCRAPE_PER_SECTION = 1;

// This object encapsulates all the logic specific to scraping Hacker News.
export const HackerNewsSource = {
	name: 'Hacker News',

	/**
	 * Collects all the unique post URLs from the main pages.
	 */
	async collectPostUrls(page: Page): Promise<Set<string>> {
		const postUrls = new Set<string>();
		const sections = ['news', 'newest', 'front', 'show'];

		for (const section of sections) {
			console.log(`\n🔍 Scraping section: ${section}`);
			let currentUrl = `${HN_BASE_URL}${section}`;

			for (let i = 0; i < PAGES_TO_SCRAPE_PER_SECTION; i++) {
				console.log(`   -> Navigating to page ${i + 1}: ${currentUrl}`);
				await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });

				const postRows = await page.$$('tr.athing');
				for (const row of postRows) {
					const sourceId = await row.getAttribute('id');
					if (sourceId) {
						const fullUrl = `${HN_BASE_URL}item?id=${sourceId}`;
						if (!postUrls.has(fullUrl)) {
							postUrls.add(fullUrl);
						}
					}
				}

				const nextPageLink = await page.$('a.morelink');
				if (nextPageLink) {
					const nextPageHref = await nextPageLink.getAttribute(
						'href'
					);
					if (nextPageHref) {
						currentUrl = `${HN_BASE_URL}${nextPageHref}`;
					} else {
						break;
					}
				} else {
					break;
				}
			}
		}
		return postUrls;
	},

	/**
	 * Processes a single post page, scraping its details and comments.
	 */
	async processPost(page: Page, url: string): Promise<void> {
		console.log(`   -> Processing post: ${url}`);
		try {
			await page.goto(url, { waitUntil: 'domcontentloaded' });

			const sourceId = url.split('id=')[1];
			const titleElement = await page.$('tr.athing .titleline > a');
			const title =
				(await titleElement?.textContent()) || 'No Title Found';
			const authorElement = await page.$('td.subtext a.hnuser');
			const author = (await authorElement?.textContent()) || 'N/A';

			const postId = await insertPost({
				sourceId,
				sourceUrl: url,
				title,
				author,
			});

			if (postId) {
				// Future logic:
				// await this.scrapeComments(page, postId);
			}
		} catch (err) {
			console.error(`      [Error] Failed to process post ${url}:`, err);
		}
	},

	/**
	 * Scrapes all comments from a post page.
	 */
	async scrapeComments(page: Page, postId: number): Promise<void> {
		// This is our next step to build out.
		// It will find all comment elements, extract their text, and save them.
	},
};
