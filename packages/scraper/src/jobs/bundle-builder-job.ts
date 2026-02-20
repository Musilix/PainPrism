import {
	getAllPostIdsWithComments,
	getBundlesWithCommentCountAtCreation,
	getCommentCountsByPostIds,
	findBundleByPostId,
	getPostWithCommentsCurated,
	insertBundle,
	insertBundleComment,
	deleteBundle,
} from '../db/queries.js';
import {
	MAX_COMMENTS_PER_BUNDLE,
	MIN_NEW_COMMENTS_TO_REBUNDLE,
	MAX_DEPTH_PER_BRANCH,
	MIN_COMMENT_USEFULNESS_FOR_BUNDLE,
	MIN_COMMENT_GENERALITY_FOR_BUNDLE,
} from '../constants.js';

function median(arr: number[]): number {
	if (arr.length === 0) return 0;
	const sorted = [...arr].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1]! + sorted[mid]!) / 2
		: sorted[mid]!;
}

function avg(arr: number[]): number {
	if (arr.length === 0) return 0;
	return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function max(arr: number[]): number {
	if (arr.length === 0) return 0;
	return Math.max(...arr);
}

export async function runBundleBuilderJob() {
	console.log('[Bundle Builder] Starting...');

	// 1. Find stale bundles: rebundle only when at least MIN_NEW_COMMENTS_TO_REBUNDLE new comments
	const existingBundles = await getBundlesWithCommentCountAtCreation();
	const stalePostIds: number[] = [];
	if (existingBundles.length > 0) {
		const postIds = [...new Set(existingBundles.map((b) => b.postId))];
		const currentCounts = await getCommentCountsByPostIds(postIds);
		for (const b of existingBundles) {
			const now = currentCounts.get(b.postId) ?? 0;
			const atCreation = b.commentCountAtCreation ?? 0;
			const newComments = now - atCreation;
			if (newComments >= MIN_NEW_COMMENTS_TO_REBUNDLE) {
				await deleteBundle(b.id);
				stalePostIds.push(b.postId);
			}
		}
	}

	// 2. Post IDs that need a bundle: no bundle yet or stale (we just deleted)
	const newPostIds = await getAllPostIdsWithComments();
	const postIdsToBuild = [...new Set([...newPostIds, ...stalePostIds])];
	const total = postIdsToBuild.length;
	console.log(`[Bundle Builder] Checking ${total} posts for bundle creation...`);
	if (stalePostIds.length > 0) {
		console.log(`   (${stalePostIds.length} stale bundles removed, will rebuild)`);
	}

	let created = 0;
	const logInterval = 25;
	for (let i = 0; i < postIdsToBuild.length; i++) {
		const postId = postIdsToBuild[i]!;
		const existing = await findBundleByPostId(postId);
		if (existing) continue;

		const data = await getPostWithCommentsCurated(
			postId,
			MAX_DEPTH_PER_BRANCH,
			MIN_COMMENT_USEFULNESS_FOR_BUNDLE,
			MIN_COMMENT_GENERALITY_FOR_BUNDLE,
			MAX_COMMENTS_PER_BUNDLE
		);
		if (!data) continue;

		const usefulnessList: number[] = [];
		const generalityList: number[] = [];
		for (const c of data.comments) {
			if (c.usefulnessScore != null) usefulnessList.push(c.usefulnessScore);
			if (c.generalityScore != null) generalityList.push(c.generalityScore);
		}
		if (data.post.usefulnessScore != null) usefulnessList.push(data.post.usefulnessScore);
		if (data.post.generalityScore != null) generalityList.push(data.post.generalityScore);

		const medianUsefulness = median(usefulnessList) || null;
		const medianGenerality = median(generalityList) || null;
		const avgUsefulness = usefulnessList.length ? avg(usefulnessList) : null;
		const avgGenerality = generalityList.length ? avg(generalityList) : null;
		const maxUsefulness = usefulnessList.length ? max(usefulnessList) : null;
		const maxGenerality = generalityList.length ? max(generalityList) : null;
		const commentCountAtCreation = data.comments.length;

		const row = await insertBundle({
			postId,
			rootCommentId: null,
			bundleType: 'full_thread',
			medianUsefulness,
			medianGenerality,
			avgUsefulness,
			avgGenerality,
			maxUsefulness,
			maxGenerality,
			commentCountAtCreation,
		});
		if (row) {
			for (const c of data.comments) {
				await insertBundleComment(row.id, c.id);
			}
			created++;
		}

		const processed = i + 1;
		if (processed % logInterval === 0 || processed === total) {
			console.log(`   [${processed}/${total}] ${created} bundles created`);
		}
	}
	console.log(`[Bundle Builder] Done. Created ${created} bundles.\n`);
}

