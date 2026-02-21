import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InsightsModule } from './insights/insights.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClustersModule } from './clusters/clusters.module';
import { BundlesModule } from './bundles/bundles.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'; // Import the new modules
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		// Configure the throttler module
		ThrottlerModule.forRoot([
			{
				ttl: 60000, // Time-to-live in milliseconds (60 seconds)
				limit: 30, // Max 30 requests per `ttl` per user/IP
			},
		]),
		DrizzleModule,
		InsightsModule,
		AuthModule,
		UsersModule,
		ClustersModule,
		BundlesModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
