import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaOption } from '../meta-option.entity';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-meta-options.dto';

@Injectable()
export class MetaOptionsService {

  private readonly logger = new Logger(MetaOptionsService.name)

  constructor(
    @InjectRepository(MetaOption)
    private readonly metaOptionRepository: Repository<MetaOption>,
  ) {}

  public async createMetaOption(
    createPostsMetaOptionsDto: CreatePostMetaOptionsDto,
  ) {
    let metaOption = this.metaOptionRepository.create(
      createPostsMetaOptionsDto,
    );

    try {
      metaOption = await this.metaOptionRepository.save(metaOption);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return metaOption;
  }

  public async getMetaOptions() {
    try {
      return await this.metaOptionRepository.find();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getMetaOptionById(id: number) {
    let metaOption: MetaOption | null = null;

    try {
      metaOption = await this.metaOptionRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!metaOption)
      throw new BadRequestException('Meta option not found', {
        description: 'the meta option is not found',
      });

    return metaOption;
  }

  //   public async updateMetaOption(id: number, updateMetaOptionDto: UpdateMetaOptionDto) {
  //     const metaOption = await this.getMetaOptionById(id);
  //     if (!metaOption) {
  //       throw new Error('Meta option not found');
  //     }
  //     metaOption.metaValue = updateMetaOptionDto.metaValue;
  //     return await this.metaOptionRepository.save(metaOption);
  //   }

  public async deleteMetaOption(id: number) {
    let metaOption: MetaOption | null = null;
    try {
      metaOption = await this.getMetaOptionById(id);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!metaOption)
      throw new BadRequestException('Meta option not found', {
        description: 'the meta option is not found',
      });

    try {
      return await this.metaOptionRepository.remove(metaOption);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
