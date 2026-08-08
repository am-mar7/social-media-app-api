import { IntersectionType } from '@nestjs/mapped-types';
import { IsISO8601, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-quey.dto';

class GetPostsBaseDto {
  @IsOptional()
  @IsISO8601()
  startDate?: Date;

  @IsOptional()
  @IsISO8601()
  endDate?: Date;
}

export class GetPostsDto extends IntersectionType(
  PaginationQueryDto,
  GetPostsBaseDto,
) {}
