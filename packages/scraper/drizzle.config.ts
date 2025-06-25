import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Simplified call. It will find the .env in the project root
// when you run the pnpm command from the root.
dotenv.config();

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set in environment variables');
}

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
