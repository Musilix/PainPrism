import {
	findInsightBySourceCommentId,
	insertInsight,
	insertComment,
} from '../db/queries.js';
import { analyzeComment, createEmbedding } from '../analysis/openai.js';
import { RawComment } from '../types.js';
import { INSIGHT_KEYWORDS } from '../constants.js';

const keywordRegex = new RegExp(INSIGHT_KEYWORDS.join('|'), 'i');

/**
 * A service class responsible for orchestrating the entire comment processing pipeline.
 * Each instance manages its own cache for a single post processing run so we dont run out of memory
 * going through all posts and sharing 1 cache
 */
export class CommentProcessingService {
	private commentTextCache: { [key: string]: string } = {};

	private passesKeywordCheck(text: string): boolean {
		return keywordRegex.test(text);
	}

	/**
	 * The main entry point for the pipeline. It processes a single raw comment,
	 * including caching, filtering, analysis, and database insertion.
	 */
	public processRawCommentPipeline = async (
		comment: RawComment
	): Promise<void> => {
		// First, save the raw comment to our database. This gives us a complete record.
		await insertComment({
			postId: comment.postId,
			parentSourceId: comment.parentSourceId,
			sourceCommentId: comment.sourceCommentId,
			author: comment.author,
			text: comment.text,
		});

		// Cache the text for context lookups of its children.
		// The idea is that we've already cached a comments parent and/or grandparent comment in this array
		// by the time we've gotten to said comments, so we can easily reference back to them here.
		this.commentTextCache[comment.sourceCommentId] = comment.text;

		// --- ANALYSIS PIPELINE ---
		// 1. Skip analysis for short comments
		if (comment.text.length < 50) return;
		// 2. Check if already analyzed for insight
		if (await findInsightBySourceCommentId(comment.sourceCommentId)) return;
		// 3. Keyword pre-filter - only pass comments that "look" sentiment heavy to the AI

		if (!this.passesKeywordCheck(comment.text)) return;

		console.log(
			`[Analyze] Potential insight in ${comment.sourceCommentId}. Running analysis...`
		);

// 4. If we got through the checks, get context (posts title and conent + comment hierarchy if it exists) and analyze
		const analysisResult = await analyzeComment({
			post_title: comment.post_title,
			post_content: comment.post_content,
			grandparent_comment: comment.grandparentSourceId
				? this.commentTextCache[comment.grandparentSourceId]
				: null,
			parent_comment: comment.parentSourceId
				? this.commentTextCache[comment.parentSourceId]
				: null,
			target_comment: comment.text,
		});

		if (analysisResult) {
			if (analysisResult.contains_insight && analysisResult.summary) {
				// A valuable insight was found. Create an embedding for it!
				console.log(
					`Insight found in ${comment.sourceCommentId}! Processing...`
				);
				console.log('AI Analysis Result:', analysisResult);

				const embeddingVector = await createEmbedding(
					analysisResult.summary
				);
				if (embeddingVector) {
					await insertInsight({
						postId: comment.postId,
						sourceCommentId: comment.sourceCommentId,
						type: analysisResult.insight_type!,
						textSummary: analysisResult.summary,
						tags: analysisResult.tags,
						embedding: embeddingVector,
						subject_name: analysisResult.subject_name,
						subject_description: analysisResult.subject_description,
					});
				}
			} else {
				// Analyzed, but found to be worthless. Create a "tombstone" record.
				// This helps gauge how good our prefilter keyword list is. If we have a lot of
				// records in insights marked with null type, textSummary, tags, and embeddings, then
				// we know our keyword list sucks.
				console.log(
					`      [Tombstone] Comment ${comment.sourceCommentId} analyzed but contains no insight. Marking as processed.`
				);
				await insertInsight({
					postId: comment.postId,
					sourceCommentId: comment.sourceCommentId,
					type: null,
					textSummary: null,
					tags: null,
					embedding: null,
				});
			}
		}
	};
}
