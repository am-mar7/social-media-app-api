import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentCommentId?: number;

  @IsInt()
  @Type(() => Number)
  postId: number;

  // should be provided by the jwt token, not the client
  // @IsInt()
  // @Type(() => Number)
  // commenterId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  repliedToId?: number;
}
