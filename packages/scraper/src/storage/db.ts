import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export async function insertPost(post: {
	sourceId: string;
	sourceUrl: string;
	title: string;
	author: string;
}) {
	const { sourceId, sourceUrl, title, author } = post;
	const existingPost = await query(
		'SELECT id FROM posts WHERE source_id = $1',
		[sourceId]
	);
	if (existingPost.rows.length > 0) {
		console.log(
			`   [DB] Post with source_id ${sourceId} already exists. Skipping insertion.`
		);
		return existingPost.rows[0].id;
	}
	const insertQuery = `
    INSERT INTO posts(source_id, source_url, title, author)
    VALUES($1, $2, $3, $4)
    RETURNING id;
  `;
	const values = [sourceId, sourceUrl, title, author];
	try {
		const res = await query(insertQuery, values);
		console.log(
			`   [DB] Inserted new post with source_id ${sourceId}. DB ID: ${res.rows[0].id}`
		);
		return res.rows[0].id;
	} catch (err) {
		console.error(
			`[DB] Error inserting post with source_id ${sourceId}:`,
			err
		);
		return null;
	}
}
