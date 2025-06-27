import {
	Controller,
	Get,
	Query,
	ParseIntPipe,
	DefaultValuePipe,
	UseGuards,
	Request,
	ValidationPipe,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'; // We'll create this simple guard
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

		// The query.page check is still valid
		if (!isLoggedIn && query.page > 3) {
			return [];
		}

		// Now we pass the validated query object to the service
		return this.insightsService.findAllPaginated(query);
	}
}
