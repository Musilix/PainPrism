import {
	serial,
	text,
	varchar,
	timestamp,
	integer,
	pgTable,
	primaryKey,
	customType,
	AnyPgColumn,
} from 'drizzle-orm/pg-core';

// Correctly define the custom type for pgvector for modern Drizzle versions
const vector = (name: string, { dimensions }: { dimensions: number }) =>
	customType<{ data: number[]; driverData: string }>({
		dataType() {
			return `vector(${dimensions})`;
		},
		toDriver(value: number[]): string {
			return `[${value.join(',')}]`;
		},
	})(name);

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	sourceId: varchar('source_id', { length: 255 }).unique().notNull(),
	sourceUrl: varchar('source_url', { length: 2048 }).notNull(),
	title: text('title').notNull(),
	author: varchar('author', { length: 255 }),
	scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow(),
});

export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.references(() => posts.id, { onDelete: 'cascade' })
		.notNull(),
	parentCommentId: integer('parent_comment_id').references(
		(): AnyPgColumn => comments.id
	),
	sourceCommentId: varchar('source_comment_id', { length: 255 })
		.unique()
		.notNull(),
	author: varchar('author', { length: 255 }),
	text: text('text').notNull(),
	scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow(),
});

export const insights = pgTable('insights', {
	id: serial('id').primaryKey(),
	postId: integer('post_id').references(() => posts.id, {
		onDelete: 'cascade',
	}),
	sourceCommentId: varchar('source_comment_id', { length: 255 })
		.unique()
		.notNull(),
	type: varchar('type', { length: 50 }),
	textSummary: text('text_summary'),
	tags: text('tags').array(),
	embedding: vector('embedding', { dimensions: 384 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const clusters = pgTable('clusters', {
	id: serial('id').primaryKey(),
	representativeText: text('representative_text').notNull(),
	popularityScore: integer('popularity_score').default(1),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const insightClusterLink = pgTable(
	'insight_cluster_link',
	{
		insightId: integer('insight_id').references(() => insights.id, {
			onDelete: 'cascade',
		}),
		clusterId: integer('cluster_id').references(() => clusters.id, {
			onDelete: 'cascade',
		}),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.insightId, table.clusterId] }),
	})
);

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).unique().notNull(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	subscriptionStatus: varchar('subscription_status', { length: 50 }).default(
		'free'
	),
	stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
