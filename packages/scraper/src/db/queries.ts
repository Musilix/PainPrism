import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// This will now find the .env file in your project root
dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export async function insertPost(post: {
	sourceId: string;
	sourceUrl: string;
	title: string;
	author: string;
}) {
	// Extract important shits
	const { sourceId, sourceUrl, title, author } = post;

	// Check for existing record of a given post
	const existingPost = await db.query.posts.findFirst({
		where: (posts) => eq(posts.sourceId, sourceId),
	});
	if (existingPost) {
		console.log(
			`   [DB] Post with source_id ${sourceId} already exists. Skipping insertion.`
		);
		return existingPost.id;
	}

	// Insert new post if no record exists yet
	try {
		const newPosts = await db
			.insert(schema.posts)
			.values({
				sourceId,
				sourceUrl,
				title,
				author,
			})
			.returning({ id: schema.posts.id });

		const postId = newPosts[0].id;
		console.log(
			`   [DB] Inserted new post with source_id ${sourceId}. DB ID: ${postId}`
		);

		// Return the PK
		return postId;
	} catch (err) {
		console.error(
			`[DB] Error inserting post with source_id ${sourceId}:`,
			err
		);
		return null;
	}
}
