import {
	findUnscoredPosts,
	findUnscoredComments,
	updatePostScores,
	updateCommentScores,
} from '../db/queries.js';
import { scoreUsefulnessGenerality } from '../analysis/score-usefulness.js';
import { SCORE_BATCH_SIZE, SCORE_DELAY_MS, SCORE_MAX_POSTS_PER_RUN, SCORE_MAX_COMMENTS_PER_RUN } from '../constants.js';

function delay(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

export async function runScoreJob() {
	console.log('[Score Job] Starting. Will score all unscored posts, then all unscored comments.\n');

	// Process unscored posts then comments. Fetch in chunks of SCORE_BATCH_SIZE. If SCORE_MAX_*_PER_RUN > 0, stop after that many per run (for bounded scheduled runs).
	let postCount = 0;
	let postChunk = 0;
	let posts: Awaited<ReturnType<typeof findUnscoredPosts>>;
	while ((posts = await findUnscoredPosts(SCORE_BATCH_SIZE)).length > 0) {
		if (SCORE_MAX_POSTS_PER_RUN > 0 && postCount >= SCORE_MAX_POSTS_PER_RUN) break;
		postChunk++;
		const toProcess = SCORE_MAX_POSTS_PER_RUN > 0
			? posts.slice(0, SCORE_MAX_POSTS_PER_RUN - postCount)
			: posts;
		console.log(`[Score Job] Posts chunk ${postChunk}: ${toProcess.length} to score.`);
		for (let i = 0; i < toProcess.length; i++) {
			const post = toProcess[i]!;
			const text = [post.title, post.post_content].filter(Boolean).join('\n');
			const score = await scoreUsefulnessGenerality(text);
			if (score) {
				await updatePostScores(post.id, score.usefulness, score.generality);
				postCount++;
			}
			console.log(`   [${i + 1}/${toProcess.length}] post id ${post.id} ${score ? '✓' : '-'}`);
			await delay(SCORE_DELAY_MS);
		}
	}
	console.log(`   -> Scored ${postCount} posts total.\n`);

	let commentCount = 0;
	let commentChunk = 0;
	let comments: Awaited<ReturnType<typeof findUnscoredComments>>;
	while ((comments = await findUnscoredComments(SCORE_BATCH_SIZE)).length > 0) {
		if (SCORE_MAX_COMMENTS_PER_RUN > 0 && commentCount >= SCORE_MAX_COMMENTS_PER_RUN) break;
		commentChunk++;
		const toProcess = SCORE_MAX_COMMENTS_PER_RUN > 0
			? comments.slice(0, SCORE_MAX_COMMENTS_PER_RUN - commentCount)
			: comments;
		console.log(`[Score Job] Comments chunk ${commentChunk}: ${toProcess.length} to score.`);
		for (let i = 0; i < toProcess.length; i++) {
			const comment = toProcess[i]!;
			const score = await scoreUsefulnessGenerality(comment.text);
			if (score) {
				await updateCommentScores(comment.id, score.usefulness, score.generality);
				commentCount++;
			}
			console.log(`   [${i + 1}/${toProcess.length}] comment id ${comment.id} ${score ? '✓' : '-'}`);
			await delay(SCORE_DELAY_MS);
		}
	}
	console.log(`   -> Scored ${commentCount} comments total.\n`);
	console.log(`[Score Job] Done. Scored ${postCount} posts, ${commentCount} comments.`);
}

