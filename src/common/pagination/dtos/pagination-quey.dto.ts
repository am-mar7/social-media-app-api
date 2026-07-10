import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  //@Type(() => Number) no need for type conversion duo to enableImplicitConversion in main.ts
  page?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  //@Type(() => Number) no need for type conversion duo to enableImplicitConversion in main.ts
  limit?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  //@Type(() => Number) no need for type conversion duo to enableImplicitConversion in main.ts
  pageSize?: number;
}