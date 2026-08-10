import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PostStatus, PostType } from '../enums';
import { Type } from 'class-transformer';
import { CreatePostMetaOptionsDto } from '../../meta-options/dtos/create-post-meta-options.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(96)
  title: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  postType: PostType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'A slug must contain only lowercase letters, numbers, and "-" between words',
  })
  @MaxLength(96)
  slug: string;

  @IsEnum(PostStatus)
  @IsNotEmpty()
  status: PostStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  content?: string;

  @IsJSON()
  @IsOptional()
  schema?: string;

  @IsUrl()
  @IsOptional()
  featuredImageUrl?: string;

  @IsISO8601()
  @IsOptional()
  publishedAt?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostMetaOptionsDto)
  metaOptions?: CreatePostMetaOptionsDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tags?: number[];
}
