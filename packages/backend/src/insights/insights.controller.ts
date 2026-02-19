import {
	Controller,
	Get,
	Query,
	UseGuards,
	Request,
	ValidationPipe,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GetInsightsQueryDto } from './dto/get-insights-query.dto';

@Controller('insights')
export class InsightsController {
	constructor(private readonly insightsService: InsightsService) {}

	@UseGuards(OptionalJwtAuthGuard)
	@Get()
	findAll(
		@Request() req,
		@Query(new ValidationPipe({ transform: true, whitelist: true }))
		query: GetInsightsQueryDto
	) {
		const isLoggedIn = !!req.user;

		if (!isLoggedIn && query.page > 3) {
			// Keep a safeguard for guests
			return { data: [], total: 0 };
		}

		return this.insightsService.findAllPaginated(query);
	}
}
