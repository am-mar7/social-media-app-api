import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Comment } from '../comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { PostsService } from 'src/posts/providers/posts.service';
import { UsersService } from 'src/users/providers/users.service';
import { UploadsService } from 'src/uploads/providers/uploads.service';
import { PatchCommentDto } from '../dtos/update-comment.dto';
import { Uploads } from 'src/uploads/uploads.entity';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  public async createComment(
    createCommentDto: CreateCommentDto,
    commenterId: number,
  ) {
    const {
      content,
      parentCommentId,
      postId,
      repliedToId,
      uploadedFileUrl: url,
    } = createCommentDto;

    if (repliedToId && !parentCommentId)
      throw new BadRequestException('repliedToId requires a parentCommentId');

    const [post, commenter, parentComment, repliedTo, uploadedFileUrl] =
      await Promise.all([
        this.postsService.getPostById(postId),
        this.usersService.findUserById(commenterId),
        parentCommentId
          ? this.commentsRepository.findOne({ where: { id: parentCommentId } })
          : Promise.resolve(null),
        repliedToId
          ? this.usersService.findUserById(repliedToId)
          : Promise.resolve(null),
        url ? this.uploadsService.findUploadByUrl(url) : Promise.resolve(null),
      ]);

    if (parentCommentId && !parentComment)
      throw new NotFoundException(
        `Comment with ID ${parentCommentId} not found`,
      );

    try {
      const comment = this.commentsRepository.create({
        content,
        parentComment: parentComment || undefined,
        post,
        commenter,
        repliedTo: repliedTo || undefined,
        uploadedFileUrl: uploadedFileUrl || undefined,
      });
      return await this.commentsRepository.save(comment);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  public async updateComment(
    id: number,
    PatchCommentDto: PatchCommentDto,
    userId: number,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { commenter: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    if (comment.commenter.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this comment',
      );
    }

    comment.content = PatchCommentDto.content ?? comment.content;

    const url = PatchCommentDto.uploadedFileUrl;
    let uploadedFileUrl: Uploads | null = null;
    if (url) {
      uploadedFileUrl = await this.uploadsService.findUploadByUrl(url);
      if (!uploadedFileUrl) {
        throw new NotFoundException(`Uploaded file with URL ${url} not found`);
      }
    }

    if (uploadedFileUrl) comment.uploadedFileUrl = uploadedFileUrl;
    else if (url === null) comment.uploadedFileUrl = null;

    try {
      return await this.commentsRepository.save(comment);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  public async deleteComment(id: number, userId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { commenter: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.commenter.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this comment',
      );
    }

    try {
      await this.commentsRepository.remove(comment);
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

  public async getPostComments(postId: number) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    try {
      return await this.commentsRepository.find({
        where: { post: { id: postId } },
        relations: { commenter: true, uploadedFileUrl: true, replies: true },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to retrieve comments');
    }
  }
}
