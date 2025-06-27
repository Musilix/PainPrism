import { Module } from '@nestjs/common';
import { ClustersController } from './clusters.controller';
import { ClustersService } from './clusters.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [ClustersController],
  providers: [ClustersService],
})
export class ClustersModule {}