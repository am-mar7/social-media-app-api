import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './providers/comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { ActiveUser } from 'src/auth/decorator/activeUser.decorator';
import type { IActiveUser } from 'src/auth/interfaces/activeUser.interface';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':postId')
  public getPostComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.getPostComments(postId);
  }

  @Post()
  public createComment(
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() user: IActiveUser,
  ) {
    // extract the commenterId from the JWT token in the request context
    return this.commentsService.createComment(createCommentDto, user.id);
  }

  @Patch(':id')
  public updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @ActiveUser() user: IActiveUser,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, user.id);
  }

  @Delete(':id')
  public deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser,
  ) {
    return this.commentsService.deleteComment(id, user.id);
  }
}
