import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaOption } from '../meta-option.entity';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-meta-options.dto';

@Injectable()
export class MetaOptionsService {
  private readonly logger = new Logger(MetaOptionsService.name);

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

  public async getPostMetaOptionsByPostId(postId: number) {
    try {
      return await this.metaOptionRepository.find({
        where: { post: { id: postId } },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async replaceMetaOptionsForPost(
    postId: number,
    incoming: Array<{ id?: number; metaValue: string }>,
  ) {
    try {
      return await this.metaOptionRepository.manager.transaction(
        async (manager) => {
          const metaRepo = manager.getRepository(MetaOption);

          const existing = await metaRepo.find({
            where: { post: { id: postId } },
          });

          const toUpdate = incoming.filter((i) => !!i.id);
          const savedRows: Promise<MetaOption>[] = [];
          for (const u of toUpdate) {
            const row = existing.find((e) => e.id === u.id);
            if (row) {
              row.metaValue = u.metaValue;
              savedRows.push(metaRepo.save(row));
            }
          }

          await Promise.all(savedRows);

          const toCreate = incoming.filter((i) => !i.id);
          const createdRows: Promise<MetaOption>[] = [];
          for (const c of toCreate) {
            const newRow = metaRepo.create({
              metaValue: c.metaValue,
              post: { id: postId },
            });
            createdRows.push(metaRepo.save(newRow));
          }
          await Promise.all(createdRows);

          const keepIds = incoming.map((i) => i.id).filter(Boolean) as number[];
          if (keepIds.length) {
            await metaRepo
              .createQueryBuilder()
              .delete()
              .where('postId = :postId', { postId })
              .andWhere('id NOT IN (:...keepIds)', { keepIds })
              .execute();
          } else {
            await metaRepo.delete({ post: { id: postId } });
          }

          return await metaRepo.find({ where: { post: { id: postId } } });
        },
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        error,
        'Failed to replace meta options',
      );
    }
  }
}
