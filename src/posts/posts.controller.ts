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
import { Auth } from 'src/auth/decorator/auth.decorator';
import { AuthType } from 'src/auth/enums/auth.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Auth(AuthType.None)
  public getAllPosts(@Query() getPostsDto: GetPostsDto) {
    console.log(getPostsDto);
    return this.postsService.getAllPosts(getPostsDto);
  }

  @Get(':id')
  @Auth(AuthType.None)
  public getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @Auth(AuthType.Bearer)
  public createPost(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: IActiveUser,
  ) {
    console.log('POST DTO', createPostDto);
    console.log('ACTIVE USER', user);

    return this.postsService.createPost(createPostDto, user);
  }

  @Delete(':id')
  @Auth(AuthType.Bearer)
  public deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser,
  ) {
    return this.postsService.deletePost(id, user);
  }

  @Patch(':id')
  @Auth(AuthType.Bearer)
  public updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchPostDto: PatchPostDto,
    @ActiveUser() user: IActiveUser,
  ) {
    console.log(patchPostDto);
    return this.postsService.updatePost(id, patchPostDto, user);
  }
}
