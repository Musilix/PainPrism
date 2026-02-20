import { insertComment } from '../db/queries.js';
import { RawComment } from '../types.js';

/**
 * Pipeline used during scrape: only persists raw comments (and caches text for ordering).
 * No per-comment analysis. Run post-scrape after a scrape to score → build bundles → analyze bundles.
 */
export class CommentProcessingService {
	private commentTextCache: { [key: string]: string } = {};

	/** Saves the raw comment; used so post-scrape can score, bundle, and analyze at bundle level. */
	public processRawCommentPipeline = async (
		comment: RawComment
	): Promise<void> => {
		await insertComment({
			postId: comment.postId,
			parentSourceId: comment.parentSourceId,
			sourceCommentId: comment.sourceCommentId,
			author: comment.author,
			text: comment.text,
		});
		this.commentTextCache[comment.sourceCommentId] = comment.text;
	};
}
