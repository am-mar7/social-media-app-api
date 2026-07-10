import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  @Matches('^[a-z0-9]+(?:-[a-z0-9]+)*$')  
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  featuredImageUrl?: string;
}
