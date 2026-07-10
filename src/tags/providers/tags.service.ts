import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../tag.entity';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from '../dtos/create-tag.dto';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
      throw new InternalServerErrorException(error);
    }
  }

  public async getTagById(id: number) {
    let tag: Tag | null = null;

    try {
      tag = await this.tagsRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!tag)
      throw new BadGatewayException('Tag not found', {
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
      throw new InternalServerErrorException(error);
    }

    if (exsitingTag)
      throw new BadGatewayException('Tag already exists', {
        description: 'the tag already exists',
      });

    try {
      return await this.tagsRepository.save(tag);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getTagsWithIds(tags: number[]) {
    try {
      return await this.tagsRepository.find({
        where: { id: In(tags) },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private async deleteTagPreCheck(tag: Tag | null, id: number) {
    try {
      tag = await this.tagsRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!tag)
      throw new BadGatewayException('Tag not found', {
        description: 'the tag is not found',
      });
  }

  public async deleteTag(id: number) {
    let tag: Tag | null = null;

    this.deleteTagPreCheck(tag, id);

    try {
      await this.tagsRepository.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return { deleted: true, data: tag };
  }

  public async softDeleteTag(id: number) {
    let tag: Tag | null = null;
    this.deleteTagPreCheck(tag, id);
    try {
      await this.tagsRepository.softDelete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return { deleted: true, data: tag };
  }
}
