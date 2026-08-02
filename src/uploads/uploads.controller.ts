import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './providers/uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /// <reference types="multer" />
  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadFile(file);
  }
}
