import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule], // We import our DrizzleModule to use the service
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
