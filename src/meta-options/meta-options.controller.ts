import { Body, Controller, Get, Post } from '@nestjs/common';
import { MetaOptionsService } from './providers/meta-options.service';
import { CreatePostMetaOptionsDto } from './dtos/create-post-meta-options.dto';

@Controller('meta-options')
export class MetaOptionsController {
  constructor(private readonly metaOptionsService: MetaOptionsService) {}

  @Post()
  public async createMetaOption(
    @Body() createPostsMetaOptionsDto: CreatePostMetaOptionsDto,
  ) {
    return this.metaOptionsService.createMetaOption(
      createPostsMetaOptionsDto,
    );
  }

  @Get()
  public async getMetaOptions() {
    return this.metaOptionsService.getMetaOptions();
  }
}
