import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { insights } from './schema.js';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

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
