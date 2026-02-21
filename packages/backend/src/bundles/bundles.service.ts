import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { bundles, posts } from '@pain-prism/scraper/db/schema';
import {
	and,
	eq,
	gte,
	isNotNull,
	lte,
	desc,
	asc,
	count,
	sql,
} from 'drizzle-orm';

interface FindAllOptions {
	page: number;
	limit: number;
	type?: string;
	tags?: string[];
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class BundlesService {
	constructor(private readonly drizzleService: DrizzleService) {}

	private buildWhereConditions(options: Omit<FindAllOptions, 'page' | 'limit'>) {
		const { type, tags, startDate, endDate } = options;
		const conditions = [isNotNull(bundles.synopsis)];
		if (type && type !== 'all') {
			conditions.push(eq(bundles.type, type));
		}
		if (tags && tags.length > 0) {
			// Inclusive: bundle's tags array must include (contain) each selected tag
			const tagArray = sql`ARRAY[${sql.join(
				tags.map((tag) => sql`${tag}`),
				sql`, `
			)}]::text[]`;
			conditions.push(sql`${bundles.tags} @> ${tagArray}`);
		}
		if (startDate) {
			conditions.push(gte(bundles.createdAt, new Date(startDate)));
		}
		if (endDate) {
			conditions.push(lte(bundles.createdAt, new Date(endDate)));
		}
		return conditions;
	}

	async findCount(options: Omit<FindAllOptions, 'page' | 'limit'>) {
		const conditions = this.buildWhereConditions(options);
		const [result] = await this.drizzleService.db
			.select({ total: count() })
			.from(bundles)
			.where(and(...conditions));
		return result?.total ?? 0;
	}

	async findAllPaginated(options: FindAllOptions) {
		const {
			page,
			limit,
			type,
			tags,
			startDate,
			endDate,
			sortBy,
			sortOrder,
		} = options;

		const conditions = this.buildWhereConditions(options);

		const [rows, totalResult] = await Promise.all([
			this.drizzleService.db
				.select({
					bundle: bundles,
					sourceUrl: posts.sourceUrl,
				})
				.from(bundles)
				.innerJoin(posts, eq(bundles.postId, posts.id))
				.where(and(...conditions))
				.orderBy(
					sortBy === 'date' && sortOrder === 'asc'
						? asc(bundles.createdAt)
						: desc(bundles.createdAt)
				)
				.limit(limit)
				.offset((page - 1) * limit),
			this.drizzleService.db
				.select({ total: count() })
				.from(bundles)
				.where(and(...conditions)),
		]);

		const total = totalResult[0].total;
		const data = rows.map(({ bundle: b, sourceUrl: sourceUrlVal }) => ({
			id: b.id,
			type: b.type,
			textSummary: b.synopsis,
			subject_name: b.subjectName,
			subject_description: b.subjectDescription,
			audience_type: b.audienceType,
			market_potential: b.marketPotential,
			tags: b.tags,
			createdAt: b.createdAt,
			sourceUrl: sourceUrlVal ?? undefined,
		}));
		return { data, total };
	}

	async findOne(id: number) {
		const rows = await this.drizzleService.db
			.select({
				bundle: bundles,
				sourceUrl: posts.sourceUrl,
			})
			.from(bundles)
			.innerJoin(posts, eq(bundles.postId, posts.id))
			.where(eq(bundles.id, id))
			.limit(1);

		const row = rows[0];
		if (!row || !row.bundle.synopsis) return null;

		const b = row.bundle;
		return {
			id: b.id,
			type: b.type,
			textSummary: b.synopsis,
			subject_name: b.subjectName,
			subject_description: b.subjectDescription,
			audience_type: b.audienceType,
			market_potential: b.marketPotential,
			tags: b.tags,
			createdAt: b.createdAt,
			sourceUrl: row.sourceUrl ?? undefined,
		};
	}
}
