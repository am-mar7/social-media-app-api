import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
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
import { IActiveUser } from 'src/auth/interfaces/activeUser.interface';
import { Tag } from 'src/tags/tag.entity';

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

  private sanitizeAuthor(post: Post) {
    const { id, email, firstName, lastName } = post.author;
    return { ...post, author: { id, email, firstName, lastName } };
  }

  public async getAllPosts(getPostsDto: GetPostsDto) {
    try {
      const { data, ...rest } = await this.paginationProvider.paginateQuery(
        getPostsDto,
        this.postsRepository,
        {
          author: true,
          tags: true,
          metaOptions: true,
        },
      );

      const posts = data.map((d) => this.sanitizeAuthor(d));

      return { data: posts, ...rest };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('something went wrong');
    }
  }

  public async createPost(createPostDto: CreatePostDto, user: IActiveUser) {
    const [tags, metaOptions] = await Promise.all([
      createPostDto.tags
        ? this.tagsService.getTagsWithIds(createPostDto.tags)
        : Promise.resolve([]),

      createPostDto.metaOptions
        ? this.metaOptionsService.createMetaOption(createPostDto.metaOptions)
        : Promise.resolve(undefined),
    ]);

    if (createPostDto.tags && createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Some tags could not be found');
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      metaOptions,
      author: user,
      tags,
    });
    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('something went wrong');
    }
  }

  public async updatePost(
    id: number,
    patchPostDto: PatchPostDto,
    user: IActiveUser,
  ) {
    let post: Post | null = null;

    try {
      post = await this.postsRepository.findOne({
        where: { id },
        relations: {
          author: true,
          tags: true,
          metaOptions: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('something went wrong');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this post',
      );
    }

    const [tags, metaOptions] = await Promise.all([
      patchPostDto.tags
        ? this.tagsService.getTagsWithIds(patchPostDto.tags)
        : Promise.resolve(post.tags),

      patchPostDto.metaOptions
        ? this.metaOptionsService.createMetaOption(patchPostDto.metaOptions)
        : Promise.resolve(post.metaOptions),
    ]);

    if (patchPostDto.tags && tags && patchPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Some tags could not be found');
    }

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.slug = patchPostDto.slug ?? post.slug;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.metaOptions = metaOptions;
    post.tags = tags;
    try {
      const updatedPost = await this.postsRepository.save(post);

      return this.sanitizeAuthor(updatedPost);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('something went wrong');
    }
  }

  public async deletePost(id: number, user: IActiveUser) {
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
      throw new InternalServerErrorException('something went wrong');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this post',
      );
    }

    try {
      await this.postsRepository.delete(id);

      return this.sanitizeAuthor(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('something went wrong');
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
      throw new InternalServerErrorException('something went wrong');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.sanitizeAuthor(post);
  }
}
