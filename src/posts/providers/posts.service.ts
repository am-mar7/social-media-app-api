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
import { UploadsService } from 'src/uploads/providers/uploads.service';
import { Uploads } from 'src/uploads/uploads.entity';

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
    private readonly uploadsService: UploadsService,
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
          uploadedFiles: true,
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
    const tags = createPostDto.tags
      ? await this.tagsService.getTagsWithIds(createPostDto.tags)
      : [];

    const metaOptions = createPostDto.metaOptions
      ? createPostDto.metaOptions.map((m) => ({ metaValue: m.metaValue }))
      : undefined;

    if (createPostDto.tags && createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Some tags could not be found');
    }
    const urls = createPostDto.uploadedFiles || [];
    let uploadedFilesUrls = await Promise.all(
      urls.map((url) => this.uploadsService.findUploadByUrl(url)),
    );
    const foundUploads = uploadedFilesUrls.filter((upload) => upload !== null);
    if (urls.length && foundUploads.length !== urls.length) {
      throw new BadRequestException('Some uploads could not be found');
    }
    uploadedFilesUrls = foundUploads;

    const post = this.postsRepository.create({
      ...createPostDto,
      metaOptions,
      author: user,
      tags,
      uploadedFiles: uploadedFilesUrls as Uploads[],
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
    const urls = patchPostDto.uploadedFiles;
    const [tags, metaOptions, uploadedFiles] = await Promise.all([
      patchPostDto.tags
        ? this.tagsService.getTagsWithIds(patchPostDto.tags)
        : Promise.resolve(post.tags),

      patchPostDto.metaOptions
        ? this.metaOptionsService.replaceMetaOptionsForPost(
            post.id,
            Array.isArray(patchPostDto.metaOptions)
              ? patchPostDto.metaOptions
              : [patchPostDto.metaOptions],
          )
        : Promise.resolve(post.metaOptions),
      patchPostDto.uploadedFiles
        ? Promise.all(
            patchPostDto.uploadedFiles.map((url) =>
              this.uploadsService.findUploadByUrl(url),
            ),
          ).then((uploads) => {
            const found = uploads.filter((upload) => upload !== null);
            if (
              patchPostDto.uploadedFiles &&
              patchPostDto.uploadedFiles.length &&
              found.length !== patchPostDto.uploadedFiles.length
            ) {
              throw new BadRequestException('Some uploads could not be found');
            }
            return found;
          })
        : Promise.resolve(post.uploadedFiles),
    ]);

    if (patchPostDto.tags && tags && patchPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Some tags could not be found');
    }

    if (urls === null) post.uploadedFiles = [];
    else if (uploadedFiles) post.uploadedFiles = uploadedFiles;

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
          uploadedFiles: true,
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
          uploadedFiles: true,
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
