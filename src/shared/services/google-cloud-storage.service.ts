import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import {
  CloudStorageService,
  UploadOptions,
  UploadResult,
  FileMetadata,
} from './cloud-storage.interface';

@Injectable()
export class GoogleCloudStorageService implements CloudStorageService {
  private readonly logger = new Logger(GoogleCloudStorageService.name);
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME');
    
    // Initialize Google Cloud Storage
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    const keyFilename = this.configService.get<string>('GCS_KEY_FILE');
    
    if (keyFilename) {
      this.storage = new Storage({
        projectId,
        keyFilename,
      });
    } else {
      // Use default credentials (service account key in environment)
      this.storage = new Storage({
        projectId,
      });
    }

    this.logger.log(`Google Cloud Storage initialized with bucket: ${this.bucketName}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileUpload = bucket.file(path);

      const uploadOptions: any = {
        metadata: {
          contentType: options.contentType || file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
            ...options.metadata,
          },
        },
      };

      if (options.cacheControl) {
        uploadOptions.metadata.cacheControl = options.cacheControl;
      }

      // Upload file
      await fileUpload.save(file.buffer, uploadOptions);

      // Make file public if requested
      if (options.isPublic) {
        await fileUpload.makePublic();
      }

      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      this.logger.log(`File uploaded successfully: ${path}`);

      return {
        url,
        path,
        size: file.size,
        metadata: uploadOptions.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${path}:`, error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(path);

      await file.delete();
      this.logger.log(`File deleted successfully: ${path}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file ${path}:`, error);
      return false;
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(path);

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to get signed URL for ${path}:`, error);
      throw error;
    }
  }

  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(path);
      const [metadata] = await file.getMetadata();

      return {
        size: parseInt(String(metadata.size || '0')),
        contentType: metadata.contentType,
        lastModified: new Date(metadata.updated),
        etag: metadata.etag,
        metadata: metadata.metadata ? 
          Object.fromEntries(
            Object.entries(metadata.metadata).map(([key, value]) => [key, String(value)])
          ) : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${path}:`, error);
      throw error;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const sourceFile = bucket.file(sourcePath);
      const destinationFile = bucket.file(destinationPath);

      await sourceFile.copy(destinationFile);
      this.logger.log(`File copied from ${sourcePath} to ${destinationPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourcePath} to ${destinationPath}:`, error);
      return false;
    }
  }

  async generatePublicUrl(path: string): Promise<string> {
    return `https://storage.googleapis.com/${this.bucketName}/${path}`;
  }
}
