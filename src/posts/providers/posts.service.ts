import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { UsersService } from 'src/users/providers/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from '../dtos/create-post.dto';
import { MetaOptionsService } from 'src/meta-options/providers/meta-options.service';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly metaOptionsService: MetaOptionsService,
    private readonly tagsService: TagsService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getAllPosts(getPostsDto: GetPostsDto) {
    try {
      return await this.paginationProvider.paginateQuery(
        getPostsDto,
        this.postsRepository,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createPost(createPostDto: CreatePostDto) {
    const user = await this.usersService.findUserById(createPostDto.authorId);
    const tags = await this.tagsService.getTagsWithIds(
      createPostDto.tags || [],
    );

    const post = this.postsRepository.create({
      ...createPostDto,
      author: user,
      tags,
    });
    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updatePost(id: number, patchPostDto: PatchPostDto) {
    let post: Post | null = null;

    try {
      post = await this.postsRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const [tags, metaOptions] = await Promise.all([
      patchPostDto.tags
        ? this.tagsService.getTagsWithIds(patchPostDto.tags)
        : Promise.resolve([]),

      patchPostDto.metaOptions
        ? this.metaOptionsService.createMetaOption(patchPostDto.metaOptions)
        : Promise.resolve(undefined),
    ]);

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.slug = patchPostDto.slug ?? post.slug;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.metaOptions = metaOptions ?? post.metaOptions;
    post.tags = tags ?? post.tags;

    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePost(id: number) {
    let post: Post | null = null;

    try {
      post = await this.postsRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    try {
      return await this.postsRepository.delete(id);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostById(id: number) {
    let post: Post | null = null;

    try {
      post = await this.postsRepository.findOne({
        where: { id },
        relations: {
          author: true,
          metaOptions: true,
          tags: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    return post;
  }
}
