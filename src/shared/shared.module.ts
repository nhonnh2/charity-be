import { Module, Global } from '@nestjs/common';
import { UtilsService } from './services/utils.service';
import { DatabaseService } from './services/database.service';
import { FileUploadService } from './services/file-upload.service';

@Global()
@Module({
  providers: [
    UtilsService,
    DatabaseService,
    FileUploadService,
  ],
  exports: [
    UtilsService,
    DatabaseService,
    FileUploadService,
  ],
})
export class SharedModule {} 