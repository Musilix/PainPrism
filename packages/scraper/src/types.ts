import { Page } from 'playwright';

/**
 * The standard contract for any data source we build.
 */
export interface ScraperSource {
	name: string;
	collectPostUrls(page: Page): Promise<Set<string>>;
	// The pipeline function is now passed in here, per post.
	processPost(
		page: Page,
		url: string,
		onCommentFound: (comment: RawComment) => Promise<void>
	): Promise<void>;
}

/**
 * The standardized "shipping container" for a comment scraped from any source.
 */
export interface RawComment {
	postId: number;
	sourceCommentId: string;
	text: string;
	author: string;
	parentSourceId: string | null;
	grandparentSourceId: string | null;
}
