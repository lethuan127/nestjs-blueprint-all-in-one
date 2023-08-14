import { BasePagingQueryParams } from '@core/dtos/base-query-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchQueryParams extends BasePagingQueryParams {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}

export class SearchProduct extends BasePagingQueryParams {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderType?: string;
}
