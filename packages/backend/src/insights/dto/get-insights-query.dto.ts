import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, IsArray } from 'class-validator';

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
	@IsArray()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.split(',') : value
	)
	tags?: string[];

	@IsOptional()
	startDate?: string;

	@IsOptional()
	endDate?: string;

	@IsOptional()
	sortBy?: 'date';

	@IsOptional()
	@IsEnum(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc';
}
