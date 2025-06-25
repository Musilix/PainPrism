import { Page } from 'playwright';
import { insertComment, insertPost } from '../db/queries.js';
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
				await this.scrapeComments(page, postId);
			}
		} catch (err) {
			console.error(`      [Error] Failed to process post ${url}:`, err);
		}
	}

	private async scrapeComments(page: Page, postId: number): Promise<void> {
		console.log(`      -> Scraping comments for post ID: ${postId}`);
		const commentRows = await page.$$('tr.comtr');
		console.log(`         Found ${commentRows.length} potential comments.`);

		// This now correctly stores the string-based source ID of the parent.
		const lineage: (string | null)[] = [];

		for (const commentRow of commentRows) {
			const sourceCommentId = await commentRow.getAttribute('id');
			if (!sourceCommentId) continue;

			const indentWidth = await commentRow.$eval(
				'img[src="s.gif"]',
				(img) => parseInt(img.getAttribute('width') || '0')
			);
			const indentLevel = indentWidth / 40;

			const author =
				(await commentRow
					.$eval('.comhead .hnuser', (el) => el.textContent)
					.catch(() => 'N/A')) || 'N/A';
			const commentText = await commentRow
				.$eval('.commtext', (el) => (el as HTMLElement).innerText)
				.catch(() => null);

			if (commentText && commentText.length > 50) {
				// Find the parent's source ID from our lineage tracker.
				const parentSourceId =
					indentLevel > 0 ? lineage[indentLevel - 1] : null;

				await insertComment({
					postId: postId,
					parentSourceId: parentSourceId, // Pass the string ID
					sourceCommentId: sourceCommentId,
					author: author,
					text: commentText,
				});

				// Update the lineage tracker with the current comment's source ID for the next iteration.
				lineage[indentLevel] = sourceCommentId;
			}
		}
	}
}
