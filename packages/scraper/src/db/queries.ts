import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { insights, posts, comments, bundles, bundleComments } from './schema.js';
import * as dotenv from 'dotenv';
import { eq, isNull, and, sql, inArray } from 'drizzle-orm';

// This will now find the .env file in your project root
dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });
type NewInsight = typeof insights.$inferInsert;

export async function insertPost(post: {
	sourceId: string;
	sourceUrl: string;
	title: string;
	post_content: string | null;
	author: string;
}) {
	const { sourceId, sourceUrl, title, post_content, author } = post;
	const existingPost = await db.query.posts.findFirst({
		where: (posts) => eq(posts.sourceId, sourceId),
	});

	if (existingPost) {
		console.log(
			`   [DB] Post with source_id ${sourceId} already exists. Skipping insertion.`
		);
		return existingPost.id;
	}

	try {
		const newPosts = await db
			.insert(schema.posts)
			.values({
				sourceId,
				sourceUrl,
				title,
				post_content,
				author,
			})
			.returning({ id: schema.posts.id });

		const postId = newPosts[0].id;
		console.log(
			`   [DB] Inserted new post with source_id ${sourceId}. DB ID: ${postId}`
		);
		return postId;
	} catch (err) {
		console.error(
			`[DB] Error inserting post with source_id ${sourceId}:`,
			err
		);
		return null;
	}
}

export async function insertComment(comment: {
	postId: number;
	parentSourceId: string | null;
	sourceCommentId: string;
	author: string;
	text: string;
}) {
	const { postId, parentSourceId, sourceCommentId, author, text } = comment;

	if (
		await db.query.comments.findFirst({
			where: (c) => eq(c.sourceCommentId, sourceCommentId),
		})
	) {
		return;
	}

	let parentDbId: number | null = null;
	if (parentSourceId) {
		const parentComment = await db.query.comments.findFirst({
			columns: { id: true },
			where: (c) => eq(c.sourceCommentId, parentSourceId),
		});
		if (parentComment) {
			parentDbId = parentComment.id;
		}
	}

	try {
		await db.insert(schema.comments).values({
			postId,
			parentCommentId: parentDbId,
			sourceCommentId,
			author,
			text,
		});
		console.log(
			`      ---> Stored comment ${sourceCommentId} (Parent: ${
				parentSourceId || 'None'
			})`
		);
	} catch (err) {
		console.error(`[DB] Error inserting comment ${sourceCommentId}:`, err);
	}
}

export async function findInsightBySourceCommentId(sourceCommentId: string) {
	try {
		const insight = await db.query.insights.findFirst({
			where: (insights) => eq(insights.sourceCommentId, sourceCommentId),
		});
		return insight;
	} catch (err) {
		console.error(
			`[DB] Error finding insight for sourceCommentId ${sourceCommentId}:`,
			err
		);
		return { failed: true };
	}
}

export async function insertInsight(insightData: NewInsight) {
	try {
		const [newInsight] = await db
			.insert(insights)
			.values(insightData)
			.returning();

		console.log(
			`      ✅ [DB] Inserted new insight for comment ${insightData.sourceCommentId}.`
		);

		return newInsight;
	} catch (err) {
		console.error(
			`[DB] Error inserting insight for comment ${insightData.sourceCommentId}:`,
			err
		);
		return null;
	}
}

// --- Scoring (usefulness + generality) ---
export async function findUnscoredPosts(limit: number) {
	return db.query.posts.findMany({
		where: isNull(posts.usefulnessScore),
		limit,
		columns: { id: true, title: true, post_content: true },
	});
}

export async function findUnscoredComments(limit: number) {
	return db.query.comments.findMany({
		where: isNull(comments.usefulnessScore),
		limit,
		columns: { id: true, text: true },
	});
}

export async function updatePostScores(postId: number, usefulness: number, generality: number) {
	await db.update(posts).set({
		usefulnessScore: usefulness,
		generalityScore: generality,
	}).where(eq(posts.id, postId));
}

export async function updateCommentScores(commentId: number, usefulness: number, generality: number) {
	await db.update(comments).set({
		usefulnessScore: usefulness,
		generalityScore: generality,
	}).where(eq(comments.id, commentId));
}

// --- Bundles ---
export async function findBundleByPostId(postId: number) {
	return db.query.bundles.findFirst({
		where: and(eq(bundles.postId, postId), eq(bundles.bundleType, 'full_thread')),
	});
}

export async function getPostWithComments(postId: number, maxComments: number) {
	const [post, commentList] = await Promise.all([
		db.query.posts.findFirst({
			where: eq(posts.id, postId),
			columns: { id: true, title: true, post_content: true, author: true, usefulnessScore: true, generalityScore: true },
		}),
		db.query.comments.findMany({
			where: eq(comments.postId, postId),
			columns: { id: true, parentCommentId: true, author: true, text: true, usefulnessScore: true, generalityScore: true },
			orderBy: (c, { asc }) => [asc(c.id)],
		}),
	]);
	if (!post) return null;
	const commentListCapped = commentList.slice(0, maxComments);
	return { post, comments: commentListCapped };
}

/** Comment row shape for tree building. */
export type CommentForBundle = {
	id: number;
	parentCommentId: number | null;
	author: string | null;
	text: string;
	usefulnessScore: number | null;
	generalityScore: number | null;
};

/**
 * Returns post + comments for a bundle: top-level comments + up to maxDepth levels of replies per branch,
 * including only comments with usefulness >= minUsefulness and generality >= minGenerality (null = excluded).
 * Total comments capped at totalCap. Order: top-level order, then DFS within each branch.
 */
export async function getPostWithCommentsCurated(
	postId: number,
	maxDepth: number,
	minUsefulness: number,
	minGenerality: number,
	totalCap: number
): Promise<{ post: { id: number; title: string; post_content: string | null; author: string | null; usefulnessScore: number | null; generalityScore: number | null }; comments: CommentForBundle[] } | null> {
	const [post, commentList] = await Promise.all([
		db.query.posts.findFirst({
			where: eq(posts.id, postId),
			columns: { id: true, title: true, post_content: true, author: true, usefulnessScore: true, generalityScore: true },
		}),
		db.query.comments.findMany({
			where: eq(comments.postId, postId),
			columns: { id: true, parentCommentId: true, author: true, text: true, usefulnessScore: true, generalityScore: true },
			orderBy: (c, { asc }) => [asc(c.id)],
		}),
	]);
	if (!post) return null;

	const passes = (c: CommentForBundle) =>
		c.usefulnessScore != null && c.generalityScore != null &&
		c.usefulnessScore >= minUsefulness && c.generalityScore >= minGenerality;

	const byParent = new Map<number | null, CommentForBundle[]>();
	for (const c of commentList as CommentForBundle[]) {
		const pid = c.parentCommentId;
		if (!byParent.has(pid)) byParent.set(pid, []);
		byParent.get(pid)!.push(c);
	}

	const out: CommentForBundle[] = [];
	const roots = byParent.get(null) ?? [];
	for (const root of roots) {
		if (out.length >= totalCap) break;
		if (!passes(root)) continue;
		const stack: { comment: CommentForBundle; depth: number }[] = [{ comment: root, depth: 0 }];
		while (stack.length > 0 && out.length < totalCap) {
			const { comment, depth } = stack.pop()!;
			out.push(comment);
			if (depth >= maxDepth) continue;
			const kids = byParent.get(comment.id) ?? [];
			for (let i = kids.length - 1; i >= 0; i--) {
				const k = kids[i]!;
				if (passes(k)) stack.push({ comment: k, depth: depth + 1 });
			}
		}
	}
	return { post, comments: out };
}

export async function getAllPostIdsWithCommentCount(maxCommentsPerBundle: number) {
	const rows = await db
		.select({
			postId: comments.postId,
			count: sql<number>`count(*)::int`,
		})
		.from(comments)
		.groupBy(comments.postId);
	return rows.filter((r) => r.count <= maxCommentsPerBundle).map((r) => r.postId);
}

/** All post IDs that have at least one comment (for curated bundling: we include top-level + N deep, score-filtered). */
export async function getAllPostIdsWithComments() {
	const rows = await db
		.select({ postId: comments.postId })
		.from(comments)
		.groupBy(comments.postId);
	return rows.map((r) => r.postId);
}

/** Full-thread bundles that have commentCountAtCreation set (used to detect stale). */
export async function getBundlesWithCommentCountAtCreation() {
	return db
		.select({
			id: bundles.id,
			postId: bundles.postId,
			commentCountAtCreation: bundles.commentCountAtCreation,
		})
		.from(bundles)
		.where(
			and(
				eq(bundles.bundleType, 'full_thread'),
				sql`${bundles.commentCountAtCreation} is not null`
			)
		);
}

/** Current comment count per post for the given post IDs. */
export async function getCommentCountsByPostIds(postIds: number[]) {
	if (postIds.length === 0) return new Map<number, number>();
	const rows = await db
		.select({
			postId: comments.postId,
			count: sql<number>`count(*)::int`,
		})
		.from(comments)
		.where(inArray(comments.postId, postIds))
		.groupBy(comments.postId);
	const map = new Map<number, number>();
	for (const r of rows) {
		map.set(r.postId, r.count);
	}
	return map;
}

export async function deleteBundle(bundleId: number) {
	await db.delete(bundles).where(eq(bundles.id, bundleId));
}

export async function insertBundle(bundle: {
	postId: number;
	rootCommentId?: number | null;
	bundleType: string;
	medianUsefulness: number | null;
	medianGenerality: number | null;
	avgUsefulness: number | null;
	avgGenerality: number | null;
	maxUsefulness: number | null;
	maxGenerality: number | null;
	commentCountAtCreation?: number | null;
}) {
	const [row] = await db.insert(bundles).values(bundle).returning();
	return row;
}

export async function insertBundleComment(bundleId: number, commentId: number) {
	await db.insert(bundleComments).values({ bundleId, commentId });
}

export async function getBundlesNeedingAnalysis(
	medianUsefulnessMin: number,
	medianGeneralityMin: number,
	limit: number
) {
	return db
		.select()
		.from(bundles)
		.where(
			and(
				isNull(bundles.synopsis),
				sql`${bundles.medianUsefulness} >= ${medianUsefulnessMin}`,
				sql`${bundles.medianGenerality} >= ${medianGeneralityMin}`
			)
		)
		.limit(limit);
}

export async function getBundleWithPostAndComments(bundleId: number) {
	const [bundleRow, bcRows] = await Promise.all([
		db.query.bundles.findFirst({ where: eq(bundles.id, bundleId) }),
		db.select({ commentId: bundleComments.commentId })
			.from(bundleComments)
			.where(eq(bundleComments.bundleId, bundleId)),
	]);
	if (!bundleRow) return null;
	const commentIds = bcRows.map((r) => r.commentId);
	const commentList =
		commentIds.length === 0
			? []
			: await db.query.comments.findMany({
					where: (c, { inArray }) => inArray(c.id, commentIds),
					orderBy: (c, { asc }) => [asc(c.id)],
				});
	const post = await db.query.posts.findFirst({
		where: eq(posts.id, bundleRow.postId),
	});
	return { bundle: bundleRow, post, comments: commentList };
}

export async function updateBundleSynopsis(
	bundleId: number,
	data: {
		synopsis: string;
		type: string;
		subjectName?: string | null;
		subjectDescription?: string | null;
		audienceType?: string | null;
		marketPotential?: string | null;
		tags?: string[] | null;
	}
) {
	await db
		.update(bundles)
		.set({
			synopsis: data.synopsis,
			type: data.type,
			subjectName: data.subjectName ?? null,
			subjectDescription: data.subjectDescription ?? null,
			audienceType: data.audienceType ?? null,
			marketPotential: data.marketPotential ?? null,
			tags: data.tags ?? null,
			updatedAt: new Date(),
		})
		.where(eq(bundles.id, bundleId));
}
