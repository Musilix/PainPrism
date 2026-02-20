import { Page } from 'playwright';
import { insertPost } from '../db/queries.js';
import { ScraperSource, RawComment } from '../types.js';
import { PAGES_TO_SCRAPE_PER_SECTION } from '../constants.js';

const HN_BASE_URL = 'https://news.ycombinator.com/';

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
				let added = 0;
				for (const row of postRows) {
					const sourceId = await row.getAttribute('id');
					if (sourceId) {
						postUrls.add(`${HN_BASE_URL}item?id=${sourceId}`);
						added++;
					}
				}
				console.log(`   -> Found ${added} posts on this page (${postUrls.size} unique total)`);

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
		onCommentFound: (comment: RawComment) => Promise<void>
	): Promise<void> {
		try {
			await page.goto(url, { waitUntil: 'domcontentloaded' });

			const sourceId = url.split('id=')[1];
			if (!sourceId) return;

			// Grab post details - Title, Content, Author
			const title =
				(await page
					.$eval('tr.athing .titleline > a', (el) => el.textContent)
					.catch(() => 'N/A')) || 'N/A';
			const contentElement = await page.$('.fatitem .commtext');
			const content = contentElement
				? await contentElement.innerText()
				: '';
			const author =
				(await page
					.$eval('td.subtext a.hnuser', (el) => el.textContent)
					.catch(() => 'N/A')) || 'N/A';

			const titleShort = title.length > 60 ? title.slice(0, 57) + '...' : title;
			console.log(`   -> ${titleShort}`);

			const postId = await insertPost({
				sourceId,
				sourceUrl: url,
				title,
				post_content: content,
				author,
			});

			if (postId) {
				const commentCount = await this.scrapeComments(
					page,
					postId,
					title,
					content,
					onCommentFound
				);
				console.log(`   -> ✓ Saved ${commentCount} comments`);
			}
		} catch (err) {
			console.error(`   -> [Error] Failed to process post:`, err);
		}
	}

	private async scrapeComments(
		page: Page,
		postId: number,
		postTitle: string,
		postContent: string,
		onCommentFound: (comment: RawComment) => Promise<void>
	): Promise<number> {
		const commentRows = await page.$$('tr.comtr');
		const commentLineage: (string | null)[] = [];
		let saved = 0;
		const logInterval = 25;

		for (const commentRow of commentRows) {
			try {
				const sourceCommentId = await commentRow.getAttribute('id');
				if (!sourceCommentId) continue;

				const indentWidth =
					(await commentRow.$eval('img[src="s.gif"]', (img) =>
						parseInt(img.getAttribute('width') || '0')
					)) || 0;
				const indentLevel = indentWidth / 40;

				const author =
					(await commentRow
						.$eval('.comhead .hnuser', (el) => el.textContent)
						.catch(() => 'N/A')) || 'N/A';
				const text = await commentRow
					.$eval('.commtext', (el) => (el as HTMLElement).innerText)
					.catch(() => null);

				if (text) {
					const parentSourceId =
						indentLevel > 0
							? commentLineage[indentLevel - 1]
							: null;
					const grandparentSourceId =
						indentLevel > 1
							? commentLineage[indentLevel - 2]
							: null;

					await onCommentFound({
						postId,
						sourceCommentId,
						text,
						author,
						parentSourceId,
						grandparentSourceId,
						post_title: postTitle,
						post_content: postContent,
					});

					saved++;
					if (saved % logInterval === 0) {
						console.log(`      ... ${saved} comments`);
					}

					commentLineage[indentLevel] = sourceCommentId;
				}
			} catch (error) {
				console.error(`      [Error] Comment row:`, error);
				continue;
			}
		}
		return saved;
	}
}
