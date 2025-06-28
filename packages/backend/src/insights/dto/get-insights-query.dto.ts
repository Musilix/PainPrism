import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetInsightsQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(6)
	@Max(20)
	limit: number = 20;

	@IsOptional()
	type?: string;

	@IsOptional()
	tag?: string;

	@IsOptional()
	startDate?: string;

	@IsOptional()
	endDate?: string;
}
