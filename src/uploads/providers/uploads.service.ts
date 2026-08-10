/// <reference types="multer" />
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadsToImageKitProvider } from './upload-to-imagekit.povider';
import ImageKit from 'imagekit';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Uploads } from '../uploads.entity';
import { FileTypes } from '../enums/file-types';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly imageKit: ImageKit;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Uploads)
    private readonly uploadsRepository: Repository<Uploads>,
    private readonly uploadToImageKitProvider: UploadsToImageKitProvider,
  ) {
    this.imageKit = new ImageKit({
      publicKey: this.configService.get('app.imageKitPublicKey') || '',
      privateKey: this.configService.get('app.imageKitPrivateKey') || '',
      urlEndpoint: this.configService.get('app.imageKitUrlEndpoint') || '',
    });
  }

  public async uploadFile(file: Express.Multer.File) {
    this.logger.debug(`Uploaded file: ${file?.originalname ?? 'unknown'}`);
    if (!file) throw new BadRequestException('No file provided');

    if (
      !['image/gif', 'image/png', 'image/jpeg', 'image/jpg'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Invalid file type');
    }

    // Upload to ImageKit
    try {
      const path =
        await this.uploadToImageKitProvider.uploadFileToImagekit(file);
      const uploadedFile = this.uploadsRepository.create({
        url: path,
        name: file.originalname,
        type: FileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      });
      await this.uploadsRepository.save(uploadedFile);
      return uploadedFile;
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw new InternalServerErrorException(
        'Upload failed',
        'Internal Server Error',
      );
    }
  }
}
