import { IsJSON } from "class-validator";

export class CreatePostMetaOptionsDto {
    @IsJSON()
    metaValue: string;
}
