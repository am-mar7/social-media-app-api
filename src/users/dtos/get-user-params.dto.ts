/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetUserParamsDto {
  @IsInt()
  @Type(() => Number)
  id!: number;
}
