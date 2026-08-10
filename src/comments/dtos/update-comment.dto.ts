import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class PatchCommentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUrl()
  uploadedFileUrl?: string;
}
