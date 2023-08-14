import { IsNumber, IsOptional } from 'class-validator';

export class BasePagingQueryParams {
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  page?: number;
}
