import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { clusters } from '@pain-prism/scraper/db/schema';

@Injectable()
export class ClustersService {
  constructor(private readonly db: DrizzleService) {}

  async findAll() {
    return this.db.db.select().from(clusters);
  }
}