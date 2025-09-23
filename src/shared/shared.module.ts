import { Module, Global } from '@nestjs/common';
import { UtilsService } from './services/utils.service';
import { DatabaseService } from './services/database.service';
import { FileUploadService } from './services/file-upload.service';
import { GoogleCloudStorageService } from './services/google-cloud-storage.service';
import { AzureBlobStorageService } from './services/azure-blob-storage.service';
import { MediaProcessorService } from './services/media-processor.service';

@Global()
@Module({
  providers: [
    UtilsService,
    DatabaseService,
    FileUploadService,
    GoogleCloudStorageService,
    AzureBlobStorageService,
    MediaProcessorService,
  ],
  exports: [
    UtilsService,
    DatabaseService,
    FileUploadService,
    GoogleCloudStorageService,
    AzureBlobStorageService,
    MediaProcessorService,
  ],
})
export class SharedModule {} 