import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { PatchPostDto } from './dtos/patch-post.dto';
import { GetPostsDto } from './dtos/get-posts.dto';
import { ActiveUser } from 'src/auth/decorator/activeUser.decorator';
import type { IActiveUser } from 'src/auth/interfaces/activeUser.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public getAllPosts(@Query() getPostsDto: GetPostsDto) {
    console.log(getPostsDto);
    return this.postsService.getAllPosts(getPostsDto);
  }

  @Get(':id')
  public getPostById(
    @Param('id', ParseIntPipe) id: number,
    @Query() getPostsDto: GetPostsDto,
  ) {
    console.log(getPostsDto);
    return this.postsService.getPostById(id);
  }

  @Post()
  public createPost(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: IActiveUser,
  ) {
    console.log('POST DTO', createPostDto);
    console.log('ACTIVE USER', user);

    return this.postsService.createPost(createPostDto, user);
  }

  @Delete(':id')
  public deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  @Patch(':id')
  public updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchPostDto: PatchPostDto,
  ) {
    return this.postsService.updatePost(id, patchPostDto);
  }
}
