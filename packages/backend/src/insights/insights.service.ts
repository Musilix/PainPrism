import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { insights } from '@pain-prism/scraper/db/schema';
import { and, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';

interface FindAllOptions {
  page: number;
  limit: number;
  type?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class InsightsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAllPaginated(options: FindAllOptions) {
    const { page, limit, type, tag, startDate, endDate } = options;
    
    // Dynamically build our WHERE clauses
    const conditions = [isNotNull(insights.type)];
    if (type && type !== 'all') {
      conditions.push(eq(insights.type, type));
    }
    if (tag && tag !== 'all') {
      // Drizzle syntax for checking if an array contains a value
      conditions.push(sql`${tag} = ANY (${insights.tags})`);
    }
    if (startDate) {
      conditions.push(gte(insights.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(insights.createdAt, new Date(endDate)));
    }

    return await this.drizzleService.db
      .select()
      .from(insights)
      .where(and(...conditions))
      .orderBy(sql`${insights.createdAt} DESC`)
      .limit(limit)
      .offset((page - 1) * limit);
  }
}