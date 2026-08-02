/// <reference types="multer" />
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import ImageKit from 'imagekit';
import { ConfigService } from '@nestjs/config';
import { UploadedFile } from '../interfaces/uploaded-file.interface';

@Injectable()
export class UploadsToImageKitProvider {
  private readonly logger = new Logger(UploadsToImageKitProvider.name);
  private readonly imageKit: ImageKit;

  constructor(private readonly configService: ConfigService) {
    this.imageKit = new ImageKit({
      publicKey: this.configService.get('app.imageKitPublicKey') || '',
      privateKey: this.configService.get('app.imageKitPrivateKey') || '',
      urlEndpoint: this.configService.get('app.imageKitUrlEndpoint') || '',
    });
  }

  public async uploadFileToImagekit(file: Express.Multer.File) {
    // Upload to ImageKit
    try {
      // convert to base 64
      const base64 = file.buffer.toString('base64');
      const result = await this.imageKit.upload({
        file: base64,
        fileName: file.originalname,
        folder: '/uploads',
      });
      return result.filePath;
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw new InternalServerErrorException(
        'Upload failed',
        'Internal Server Error',
      );
    }
  }

  private generateFileName(file: UploadedFile): string {
    const timestamp = Date.now().toString().trim();
    const originalName = file.originalname
      .split('.')[0]
      .replace(/\s/g, '')
      .trim();
    const extension = path.extname(file.originalname);
    return `${timestamp}_${originalName}.${extension}`;
  }
}
