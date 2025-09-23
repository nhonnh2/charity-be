export interface CloudStorageService {
  uploadFile(
    file: Express.Multer.File,
    path: string,
    options?: UploadOptions,
  ): Promise<UploadResult>;

  deleteFile(path: string): Promise<boolean>;

  getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  getFileMetadata(path: string): Promise<FileMetadata>;

  copyFile(sourcePath: string, destinationPath: string): Promise<boolean>;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  etag?: string;
  metadata?: Record<string, any>;
}

export interface FileMetadata {
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
  metadata?: Record<string, string>;
}


