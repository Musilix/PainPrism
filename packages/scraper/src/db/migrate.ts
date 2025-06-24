import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const runMigrations = async () => {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set in environment variables');
	}

	console.log('Connecting to database for migration...');
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 1,
	});
	const db = drizzle(pool);

	console.log('Running migrations...');
	await migrate(db, { migrationsFolder: './drizzle' });

	console.log('Migrations completed successfully!');
	await pool.end();
};

runMigrations().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
