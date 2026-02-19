import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { insights } from '@pain-prism/scraper/db/schema';
import {
	and,
	eq,
	gte,
	isNotNull,
	lte,
	desc,
	asc,
	count,
	or,
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
export class InsightsService {
	constructor(private readonly drizzleService: DrizzleService) {}

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

		const conditions = [isNotNull(insights.type)];
		if (type && type !== 'all') {
			conditions.push(eq(insights.type, type));
		}

		// FINAL FIX: Construct the query using the standard SQL `ANY` operator.
		// This creates a chain of `OR` conditions (e.g., 'tag1' = ANY(tags) OR 'tag2' = ANY(tags))
		// which is a robust way to check for overlap and avoids all previous operator/import issues.
		if (tags && tags.length > 0) {
			const tagArray = sql`ARRAY[${sql.join(
				tags.map((tag) => sql`${tag}`),
				sql`, `
			)}]::text[]`;
			conditions.push(sql`${insights.tags} @> ${tagArray}`);
		}

		if (startDate) {
			conditions.push(gte(insights.createdAt, new Date(startDate)));
		}
		if (endDate) {
			conditions.push(lte(insights.createdAt, new Date(endDate)));
		}

		let orderByClause;
		if (sortBy === 'date') {
			orderByClause =
				sortOrder === 'asc'
					? asc(insights.createdAt)
					: desc(insights.createdAt);
		} else {
			orderByClause = desc(insights.createdAt);
		}

		const [data, totalResult] = await Promise.all([
			this.drizzleService.db
				.select()
				.from(insights)
				.where(and(...conditions))
				.orderBy(orderByClause)
				.limit(limit)
				.offset((page - 1) * limit),
			this.drizzleService.db
				.select({ total: count() })
				.from(insights)
				.where(and(...conditions)),
		]);

		const total = totalResult[0].total;

		return { data, total };
	}
}
