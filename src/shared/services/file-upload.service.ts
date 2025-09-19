import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

@Injectable()
export class FileUploadService {
  private readonly allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly allowedDocumentTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly uploadPath = 'uploads/campaigns/';

  validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File quá lớn. Kích thước tối đa là 10MB');
    }

    // Check file type
    const fileExt = extname(file.originalname).toLowerCase();
    const allowedTypes = [...this.allowedImageTypes, ...this.allowedDocumentTypes];
    
    if (!allowedTypes.includes(fileExt)) {
      throw new BadRequestException(
        `Loại file không được hỗ trợ. Chỉ cho phép: ${allowedTypes.join(', ')}`
      );
    }
  }

  generateFileName(originalName: string): string {
    const fileExt = extname(originalName);
    const fileName = uuidv4() + fileExt;
    return fileName;
  }

  getFileType(fileName: string): 'image' | 'document' {
    const fileExt = extname(fileName).toLowerCase();
    return this.allowedImageTypes.includes(fileExt) ? 'image' : 'document';
  }

  async uploadFile(file: any): Promise<UploadedFile> {
    this.validateFile(file);

    const fileName = this.generateFileName(file.originalname);
    const fileUrl = `${this.uploadPath}${fileName}`;
    const fileType = this.getFileType(file.originalname);

    // TODO: Implement actual file storage (local, S3, etc.)
    // For now, we'll just return the metadata
    
    return {
      fileName,
      originalName: file.originalname,
      fileUrl,
      fileType,
      fileSize: file.size,
      uploadedAt: new Date(),
    };
  }

  async uploadMultipleFiles(files: any[]): Promise<UploadedFile[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được upload');
    }

    if (files.length > 10) {
      throw new BadRequestException('Tối đa 10 files cho một chiến dịch');
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      const uploadedFile = await this.uploadFile(file);
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  async deleteFile(fileName: string): Promise<void> {
    // TODO: Implement actual file deletion
    console.log(`Deleting file: ${fileName}`);
  }

  getFileUrl(fileName: string): string {
    return `${this.uploadPath}${fileName}`;
  }

  isImageFile(fileName: string): boolean {
    const fileExt = extname(fileName).toLowerCase();
    return this.allowedImageTypes.includes(fileExt);
  }

  isDocumentFile(fileName: string): boolean {
    const fileExt = extname(fileName).toLowerCase();
    return this.allowedDocumentTypes.includes(fileExt);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 