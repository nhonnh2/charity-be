import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Media, MediaSchema } from './entities/media.entity';
import { GoogleCloudStorageService } from '@shared/services/google-cloud-storage.service';
import { AzureBlobStorageService } from '@shared/services/azure-blob-storage.service';
import { MediaProcessorService } from '@shared/services/media-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    GoogleCloudStorageService,
    AzureBlobStorageService,
    MediaProcessorService,
  ],
  exports: [
    MediaService,
    GoogleCloudStorageService,
    AzureBlobStorageService,
    MediaProcessorService,
  ],
})
export class MediaModule {}


