import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlockBlobClient,
  BlobSASPermissions,
} from '@azure/storage-blob';
import {
  CloudStorageService,
  UploadOptions,
  UploadResult,
  FileMetadata,
} from './cloud-storage.interface';

@Injectable()
export class AzureBlobStorageService implements CloudStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name);
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor(private configService: ConfigService) {
    this.containerName = this.configService.get<string>('AZURE_CONTAINER_NAME');
    
    // Initialize Azure Blob Storage
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT');
    const accountKey = this.configService.get<string>('AZURE_STORAGE_KEY');
    
    if (!accountName || !accountKey) {
      throw new Error('Azure Storage account name and key are required');
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    this.blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential,
    );

    this.logger.log(`Azure Blob Storage initialized with container: ${this.containerName}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);

      const uploadOptions: any = {
        blobHTTPHeaders: {
          blobContentType: options.contentType || file.mimetype,
          blobCacheControl: options.cacheControl,
        },
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
      };

      // Upload file
      const uploadResponse = await blockBlobClient.upload(
        file.buffer,
        file.size,
        uploadOptions,
      );

      // Set public access if requested
      if (options.isPublic) {
        // For public access, we need to set appropriate headers
        // Note: This requires the storage account to allow public access
        await blockBlobClient.setHTTPHeaders({
          blobContentType: options.contentType || file.mimetype,
          blobCacheControl: 'public, max-age=31536000', // Cache for 1 year
        });
        
        // Set blob access tier to hot for better public access performance
        try {
          await blockBlobClient.setAccessTier('Hot');
        } catch (error) {
          this.logger.warn(`Failed to set access tier: ${error.message}`);
        }
      }

      const url = blockBlobClient.url;

      this.logger.log(`File uploaded successfully: ${path}`);

      return {
        url,
        path,
        size: file.size,
        etag: uploadResponse.etag,
        metadata: uploadOptions.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${path}:`, error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);

      await blockBlobClient.delete();
      this.logger.log(`File deleted successfully: ${path}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file ${path}:`, error);
      return false;
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);

      const expiresOn = new Date(Date.now() + expiresIn * 1000);
      const url = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse('r'), // read permission
        expiresOn,
      });

      return url;
    } catch (error) {
      this.logger.error(`Failed to get signed URL for ${path}:`, error);
      throw error;
    }
  }

  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(path);
      const properties = await blockBlobClient.getProperties();

      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${path}:`, error);
      throw error;
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const sourceBlobClient = containerClient.getBlockBlobClient(sourcePath);
      const destinationBlobClient = containerClient.getBlockBlobClient(destinationPath);

      const sourceUrl = sourceBlobClient.url;
      await destinationBlobClient.syncCopyFromURL(sourceUrl);
      
      this.logger.log(`File copied from ${sourcePath} to ${destinationPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourcePath} to ${destinationPath}:`, error);
      return false;
    }
  }

  async generatePublicUrl(path: string): Promise<string> {
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT');
    return `https://${accountName}.blob.core.windows.net/${this.containerName}/${path}`;
  }
}
