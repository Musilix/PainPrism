import { Page } from 'playwright';
import { insertPost } from '../db/queries.js';
import { ScraperSource, RawComment } from '../types.js';

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
					if (sourceId) {
						postUrls.add(`${HN_BASE_URL}item?id=${sourceId}`);
					}
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

	async processPost(
		page: Page,
		url: string,
		onCommentFound: (comment: RawComment) => Promise<void> // It's now received here
	): Promise<void> {
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

			// The key step when we process a post is to actually process it's comments!
			// Technically this scrapeComments fn just grabs the data of comments and sends it
			// off to our pipeline.service to actually get processed properly
			if (postId) {
				await this.scrapeComments(page, postId, onCommentFound);
			}
		} catch (err) {
			console.error(`      [Error] Failed to process post ${url}:`, err);
		}
	}

	private async scrapeComments(
		page: Page,
		postId: number,
		onCommentFound: (comment: RawComment) => Promise<void> // Received here too
	): Promise<void> {
		console.log(`      -> Scraping comments for post ID: ${postId}`);
		const commentRows = await page.$$('tr.comtr');
		console.log(`         Found ${commentRows.length} potential comments.`);

		const commentLineage: (string | null)[] = [];

		for (const commentRow of commentRows) {
			try {
				const sourceCommentId = await commentRow.getAttribute('id');
				if (!sourceCommentId) continue;

				// Find indent level of comment and thereby figure out where it stands in a given thread
				// 1 indent means its a reply, 2 means its a reply to a reply, and so on
				// This is useful for retrieving the scope of a comment and providing more context to it
				const indentWidth =
					(await commentRow.$eval('img[src="s.gif"]', (img) =>
						parseInt(img.getAttribute('width') || '0')
					)) || 0;
				const indentLevel = indentWidth / 40;

				// Grab comment data
				const author =
					(await commentRow
						.$eval('.comhead .hnuser', (el) => el.textContent)
						.catch(() => 'N/A')) || 'N/A';
				const text = await commentRow
					.$eval('.commtext', (el) => (el as HTMLElement).innerText)
					.catch(() => null);

				if (text) {
					// Set up 3 tier lineage, if possible
					const parentSourceId =
						indentLevel > 0
							? commentLineage[indentLevel - 1]
							: null;
					const grandparentSourceId =
						indentLevel > 1
							? commentLineage[indentLevel - 2]
							: null;

					// Forward the raw data to the orchestrator/ai function.
					// This class's responsibility ends here.
					await onCommentFound({
						postId,
						sourceCommentId,
						text,
						author,
						parentSourceId,
						grandparentSourceId,
					});

					// Update lineage for the next comment in the thread.
					commentLineage[indentLevel] = sourceCommentId;
				}
			} catch (error) {
				console.error(
					`      [Error] Failed to process a comment row.`,
					error
				);
				continue; // Continue to the next comment
			}
		}
	}
}
