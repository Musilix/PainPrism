import { Page } from 'playwright';
import { insertPost } from '../db/queries.js';
import { ScraperSource } from '../types.js';

const HN_BASE_URL = 'https://news.ycombinator.com/';
const PAGES_TO_SCRAPE_PER_SECTION = 1;

export class HackerNewsSource implements ScraperSource {
	public name = 'Hacker News';

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
					if (sourceId)
						postUrls.add(`${HN_BASE_URL}item?id=${sourceId}`);
				}

				const nextPageLink = await page.$('a.morelink');
				if (!nextPageLink) break;

				const nextPageHref = await nextPageLink.getAttribute('href');
				if (!nextPageHref) break;

				currentUrl = `${HN_BASE_URL}${nextPageHref}`;
			}
		}
		return postUrls;
	}

	async processPost(page: Page, url: string): Promise<void> {
		console.log(`   -> Processing post: ${url}`);
		try {
			await page.goto(url, { waitUntil: 'domcontentloaded' });

			const sourceId = url.split('id=')[1];
			if (!sourceId) return;

			const title =
				(await page
					.$eval('tr.athing .titleline > a', (el) => el.textContent)
					.catch(() => 'N/A')) || 'N/A';
			const author =
				(await page
					.$eval('td.subtext a.hnuser', (el) => el.textContent)
					.catch(() => 'N/A')) || 'N/A';

			const postId = await insertPost({
				sourceId,
				sourceUrl: url,
				title,
				author,
			});

			if (postId) {
				console.log(`I Grabbed Comments for post ${postId}! teehe jk`);
				// await this.scrapeComments(page, postId);
			}
		} catch (err) {
			console.error(`      [Error] Failed to process post ${url}:`, err);
		}
	}

	private async scrapeComments(page: Page, postId: number): Promise<void> {
		console.log(`      -> Scraping comments for post ID: ${postId}`);
		const commentRows = await page.$$('tr.comtr');
		console.log(`         Found ${commentRows.length} potential comments.`);

		for (const commentRow of commentRows) {
			const commentId = await commentRow.getAttribute('id');
			const commentText = await commentRow
				.$eval('.commtext', (el) => (el as HTMLElement).innerText)
				.catch(() => null);

			if (commentId && commentText && commentText.length > 50) {
				console.log(
					`---> Comment ${commentId} Grabbed: "${commentText.substring(
						0,
						0
					)}..."`
				);
				// AI analysis and insertion logic will go here
			}
		}
	}
}
