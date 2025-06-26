import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { insights } from '../../../scraper/src/db/schema';
import { isNotNull } from 'drizzle-orm';

@Injectable()
export class InsightsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll() {
    // Fetch all non-tombstone insights from the database
    return await this.drizzleService.db
      .select()
      .from(insights)
      .where(isNotNull(insights.type));
  }
}
