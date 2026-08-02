import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './providers/uploads.service';
import { UploadsToImageKitProvider } from './providers/upload-to-imagekit.povider';
import { UploadsEntity } from './uploads.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadsToImageKitProvider],
  imports: [TypeOrmModule.forFeature([UploadsEntity])],
})
export class UploadsModule {}
