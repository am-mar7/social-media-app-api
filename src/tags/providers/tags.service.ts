import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../tag.entity';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from '../dtos/create-tag.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  public async getAllTags() {
    try {
      return await this.tagsRepository.find();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }
  }

  public async getTagById(id: number) {
    let tag: Tag | null = null;

    try {
      tag = await this.tagsRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }

    if (!tag)
      throw new NotFoundException('Tag not found', {
        description: 'the tag is not found',
      });

    return tag;
  }

  public async createTag(tag: CreateTagDto) {
    let exsitingTag: Tag | null = null;

    try {
      exsitingTag = await this.tagsRepository.findOne({
        where: { slug: tag.slug },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }

    if (exsitingTag)
      throw new ConflictException('Tag already exists', {
        description: 'the tag already exists',
      });

    try {
      return await this.tagsRepository.save(tag);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }
  }

  public async getTagsWithIds(tags: number[]) {
    try {
      return await this.tagsRepository.find({
        where: { id: In(tags) },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }
  }

  private async deleteTagPreCheck(id: number) {
    let tag: Tag | null = null;
    try {
      tag = await this.tagsRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }

    if (!tag)
      throw new NotFoundException('Tag not found', {
        description: 'the tag is not found',
      });

    return tag;
  }

  public async deleteTag(id: number) {
    const tag = await this.deleteTagPreCheck(id);

    try {
      await this.tagsRepository.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }
    return { deleted: true, data: tag };
  }

  public async softDeleteTag(id: number) {
    const tag = await this.deleteTagPreCheck(id);
    try {
      await this.tagsRepository.softDelete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('some thing went wrong');
    }
    return { deleted: true, data: tag };
  }
}
