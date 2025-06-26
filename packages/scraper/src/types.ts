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
 * This object includes the context from the original post.
 */
export interface RawComment {
	postId: number;
	sourceCommentId: string;
	text: string;
	author: string;
	parentSourceId: string | null;
	grandparentSourceId: string | null;
	post_title: string;
	post_content: string;
}

export interface InsightAnalysisResult {
	contains_insight: boolean;
	subject_name: string | null;
	subject_description: string | null;
	audience_type: string | null;
	market_potential: string | null; 
	insight_type: 'pain-point' | 'product-yearning' | null;
	summary: string | null;
	tags: string[] | null;
}

export interface CommentContext {
	post_title: string;
	post_content: string;
	grandparent_comment: string | null;
	parent_comment: string | null;
	target_comment: string;
}