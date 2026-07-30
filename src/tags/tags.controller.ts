import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TagsService } from './providers/tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { AuthType } from 'src/auth/enums/auth.enum';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Auth(AuthType.None )
  public getTags() {
    return this.tagsService.getAllTags();
  }

  @Get(':id')
  @Auth(AuthType.None)
  public getTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.getTagById(id);
  }

  @Post()
  public create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.createTag(createTagDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.deleteTag(id);
  }

  @Delete('soft-delete/:id')
  public softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.softDeleteTag(id);
  }
}
