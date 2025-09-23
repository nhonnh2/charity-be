import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Media, MediaDocument, MediaType, MediaProvider, MediaStatus } from './entities/media.entity';
import { UploadMediaDto, QueryMediaDto, UpdateMediaDto } from './dto';
import { GoogleCloudStorageService } from '@shared/services/google-cloud-storage.service';
import { AzureBlobStorageService } from '@shared/services/azure-blob-storage.service';
import { MediaProcessorService } from '@shared/services/media-processor.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly defaultProvider: MediaProvider;

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private configService: ConfigService,
    private googleCloudService: GoogleCloudStorageService,
    private azureBlobService: AzureBlobStorageService,
    private mediaProcessorService: MediaProcessorService,
  ) {
    this.defaultProvider = this.configService.get<MediaProvider>('DEFAULT_CLOUD_PROVIDER', MediaProvider.AZURE_BLOB);
  }

  private getCloudService(provider: MediaProvider) {
    switch (provider) {
      case MediaProvider.GOOGLE_CLOUD:
        return this.googleCloudService;
      case MediaProvider.AZURE_BLOB:
        return this.azureBlobService;
      default:
        throw new BadRequestException(`Unsupported cloud provider: ${provider}`);
    }
  }

  private generateFilePath(
    userId: string,
    type: MediaType,
    originalName: string,
    provider: MediaProvider,
  ): string {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    
    const fileId = new Types.ObjectId().toString();
    const extension = originalName.split('.').pop();
    const filename = `${fileId}_${originalName}`;
    
    return `media/${provider}/${type}s/${year}/${month}/${day}/${filename}`;
  }

  private validateFile(file: Express.Multer.File, type: MediaType): void {
    const maxSize = this.configService.get<number>(`MAX_${type.toUpperCase()}_SIZE`, 10 * 1024 * 1024); // 10MB default
    
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    const allowedMimeTypes = this.getAllowedMimeTypes(type);
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed for ${type}`);
    }
  }

  private getAllowedMimeTypes(type: MediaType): string[] {
    switch (type) {
      case MediaType.IMAGE:
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      case MediaType.VIDEO:
        return ['video/mp4', 'video/webm', 'video/ogg'];
      case MediaType.AUDIO:
        return ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      case MediaType.DOCUMENT:
        return ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      default:
        return [];
    }
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    uploadDto: UploadMediaDto,
  ): Promise<MediaDocument> {
    try {
      // Validate file
      this.validateFile(file, uploadDto.type);

      // Determine provider from uploadDto or use default
      const selectedProvider = uploadDto.provider || this.defaultProvider;

      // Generate file path
      const cloudPath = this.generateFilePath(userId, uploadDto.type, file.originalname, selectedProvider);

      // Get cloud service
      const cloudService = this.getCloudService(selectedProvider);

      // Create media record with uploading status
      const media = new this.mediaModel({
        userId: new Types.ObjectId(userId),
        originalName: file.originalname,
        filename: cloudPath.split('/').pop() || file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        type: uploadDto.type,
        provider: selectedProvider,
        url: `https://placeholder.com/media/${cloudPath}`, // Temporary URL, will be updated after upload
        cloudPath,
        status: MediaStatus.UPLOADING,
        tags: uploadDto.tags || [],
        description: uploadDto.description,
        altText: uploadDto.altText,
        isPublic: uploadDto.isPublic || false,
        uploadedAt: new Date(),
      });

      const savedMedia = await media.save();

      try {
        // Process image if it's an image type
        let processedBuffer = file.buffer;
        let thumbnailBuffer: Buffer | undefined;

        if (uploadDto.type === MediaType.IMAGE) {
          // Validate image
          const isValid = await this.mediaProcessorService.validateImage(file.buffer);
          if (!isValid) {
            throw new BadRequestException('Invalid image file');
          }

          // Get image metadata
          const metadata = await this.mediaProcessorService.getImageMetadata(file.buffer);
          if (metadata) {
            savedMedia.metadata = {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              quality: 'original',
            };
          }

          // Generate thumbnail
          const thumbnailResult = await this.mediaProcessorService.generateThumbnail(file.buffer);
          thumbnailBuffer = thumbnailResult.buffer;
        }

        // Upload main file (conditional public/private based on isPublic flag)
        const uploadResult = await cloudService.uploadFile(
          { ...file, buffer: processedBuffer },
          cloudPath,
          {
            contentType: file.mimetype,
            isPublic: uploadDto.isPublic || false, // Use isPublic from request
            metadata: {
              userId,
              mediaId: savedMedia._id.toString(),
              type: uploadDto.type,
            },
          },
        );

        // Upload thumbnail if exists
        let thumbnailUrl: string | undefined;
        if (thumbnailBuffer && uploadDto.type === MediaType.IMAGE) {
          const thumbnailPath = cloudPath.replace(/(\.[^.]+)$/, '_thumb$1');
          const thumbnailResult = await cloudService.uploadFile(
            {
              ...file,
              buffer: thumbnailBuffer,
              originalname: `thumb_${file.originalname}`,
            },
            thumbnailPath,
            {
              contentType: 'image/jpeg',
              isPublic: uploadDto.isPublic || false, // Use same public setting as main file
            },
          );
          // Generate thumbnail URL based on public/private setting
          if (uploadDto.isPublic) {
            thumbnailUrl = thumbnailResult.url;
          } else {
            thumbnailUrl = await cloudService.getSignedUrl(thumbnailPath, 86400);
          }
        }

        // Generate URL based on public/private setting
        let finalUrl: string;
        if (uploadDto.isPublic) {
          // Use public URL if file is public
          finalUrl = uploadResult.url;
        } else {
          // Use signed URL for private files
          finalUrl = await cloudService.getSignedUrl(cloudPath, 86400); // 24 hours expiry
        }
        
        // Update media record with upload results
        savedMedia.url = finalUrl;
        savedMedia.status = MediaStatus.READY;
        savedMedia.processedAt = new Date();
        if (thumbnailUrl) {
          savedMedia.thumbnailUrl = thumbnailUrl;
        }

        await savedMedia.save();

        this.logger.log(`File uploaded successfully: ${savedMedia._id}`);
        return savedMedia;
      } catch (error) {
        // Update status to failed
        savedMedia.status = MediaStatus.FAILED;
        await savedMedia.save();
        
        this.logger.error(`File upload failed: ${error.message}`);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Upload process failed: ${error.message}`);
      throw error;
    }
  }

  async getMediaById(mediaId: string, userId?: string): Promise<MediaDocument> {
    const query: any = { _id: mediaId };
    
    // If userId provided, ensure user owns the media or media is public
    if (userId) {
      query.$or = [
        { userId: new Types.ObjectId(userId) },
        { isPublic: true },
      ];
    }

    const media = await this.mediaModel.findOne(query);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Increment view count
    await this.mediaModel.findByIdAndUpdate(mediaId, { $inc: { viewCount: 1 } });

    return media;
  }

  async getMediaList(queryDto: QueryMediaDto, userId?: string): Promise<{
    data: MediaDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    // User filter
    if (userId) {
      query.$or = [
        { userId: new Types.ObjectId(userId) },
        { isPublic: true },
      ];
    }

    // Apply filters
    if (queryDto.type) query.type = queryDto.type;
    if (queryDto.provider) query.provider = queryDto.provider;
    if (queryDto.status) query.status = queryDto.status;
    if (queryDto.isPublic !== undefined) query.isPublic = queryDto.isPublic;
    if (queryDto.tags && queryDto.tags.length > 0) {
      query.tags = { $in: queryDto.tags };
    }

    // Search filter
    if (queryDto.search) {
      query.$or = [
        { originalName: { $regex: queryDto.search, $options: 'i' } },
        { description: { $regex: queryDto.search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [data, total] = await Promise.all([
      this.mediaModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.mediaModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateMedia(
    mediaId: string,
    updateDto: UpdateMediaDto,
    userId: string,
  ): Promise<MediaDocument> {
    const media = await this.mediaModel.findOne({
      _id: mediaId,
      userId: new Types.ObjectId(userId),
    });

    if (!media) {
      throw new NotFoundException('Media not found or access denied');
    }

    // Update fields
    if (updateDto.tags !== undefined) media.tags = updateDto.tags;
    if (updateDto.description !== undefined) media.description = updateDto.description;
    if (updateDto.altText !== undefined) media.altText = updateDto.altText;
    if (updateDto.isPublic !== undefined) media.isPublic = updateDto.isPublic;

    await media.save();
    return media;
  }

  async deleteMedia(mediaId: string, userId: string): Promise<boolean> {
    const media = await this.mediaModel.findOne({
      _id: mediaId,
      userId: new Types.ObjectId(userId),
    });

    if (!media) {
      throw new NotFoundException('Media not found or access denied');
    }

    try {
      // Delete from cloud storage
      const cloudService = this.getCloudService(media.provider);
      await cloudService.deleteFile(media.cloudPath);

      // Delete thumbnail if exists
      if (media.thumbnailUrl) {
        const thumbnailPath = media.cloudPath.replace(/(\.[^.]+)$/, '_thumb$1');
        await cloudService.deleteFile(thumbnailPath);
      }

      // Update status to deleted
      media.status = MediaStatus.DELETED;
      media.deletedAt = new Date();
      await media.save();

      this.logger.log(`Media deleted successfully: ${mediaId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete media ${mediaId}:`, error);
      throw error;
    }
  }

  async getSignedUrl(mediaId: string, userId?: string, expiresIn: number = 3600): Promise<string> {
    const media = await this.getMediaById(mediaId, userId);
    const cloudService = this.getCloudService(media.provider);
    return cloudService.getSignedUrl(media.cloudPath, expiresIn);
  }

  async incrementDownloadCount(mediaId: string): Promise<void> {
    await this.mediaModel.findByIdAndUpdate(mediaId, { $inc: { downloadCount: 1 } });
  }
}


