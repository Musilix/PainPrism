import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Query,
	UseGuards,
	Request,
	ValidationPipe,
} from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GetInsightsQueryDto } from '../insights/dto/get-insights-query.dto';

@Controller('bundles')
export class BundlesController {
	constructor(private readonly bundlesService: BundlesService) {}

	@UseGuards(OptionalJwtAuthGuard)
	@Get()
	async findAll(
		@Request() req,
		@Query(new ValidationPipe({ transform: true, whitelist: true }))
		query: GetInsightsQueryDto
	) {
		const isPro = req.user?.status === 'pro';
		if (!isPro && query.page > 3) {
			const total = await this.bundlesService.findCount(query);
			return { data: [], total };
		}
		return this.bundlesService.findAllPaginated(query);
	}

	@UseGuards(OptionalJwtAuthGuard)
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const bundle = await this.bundlesService.findOne(id);
		if (!bundle) throw new NotFoundException('Bundle not found');
		return bundle;
	}
}
