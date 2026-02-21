import { Module } from '@nestjs/common';
import { BundlesController } from './bundles.controller';
import { BundlesService } from './bundles.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
	imports: [DrizzleModule],
	controllers: [BundlesController],
	providers: [BundlesService],
})
export class BundlesModule {}
