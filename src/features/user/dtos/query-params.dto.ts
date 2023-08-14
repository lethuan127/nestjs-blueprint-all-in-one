/* eslint-disable prettier/prettier */
import { BasePagingQueryParams } from '@core/dtos/base-query-params.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchQueryParams extends BasePagingQueryParams {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}

type SortOrder<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};

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

  // get parsedOrderBy(): SortOrder<Product> | undefined {
  //   if (!this.orderBy) {
  //     return undefined;
  //   }

  //   const sorts = this.orderBy.split(',');
  //   const order: SortOrder<Product> = {};

  //   const last = sorts[sorts.length - 1];
  //   const [field, direction] = last.trim().split(':');
  //   if (field && (direction === 'asc' || direction === 'desc')) {
  //     order[field as keyof Product] = direction;
  //   }

  //   return order;
  // }
}
