import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  resize?: 'cover' | 'contain' | 'fill';
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  density?: number;
  hasAlpha?: boolean;
}

@Injectable()
export class MediaProcessorService {
  private readonly logger = new Logger(MediaProcessorService.name);

  async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions = {},
  ): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
    try {
      let sharpInstance = sharp(buffer);

      // Get original metadata
      const originalMetadata = await sharpInstance.metadata();

      // Resize if options provided
      if (options.width || options.height) {
        const resizeOptions: any = {
          fit: options.resize || 'cover',
        };

        if (options.width && options.height) {
          resizeOptions.width = options.width;
          resizeOptions.height = options.height;
        } else if (options.width) {
          resizeOptions.width = options.width;
        } else if (options.height) {
          resizeOptions.height = options.height;
        }

        sharpInstance = sharpInstance.resize(resizeOptions);
      }

      // Apply quality and format
      if (options.format === 'jpeg' || options.format === 'webp') {
        sharpInstance = sharpInstance.jpeg({ quality: options.quality || 80 });
      } else if (options.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: options.quality || 80 });
      }

      // Process image
      const processedBuffer = await sharpInstance.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      const metadata: ImageMetadata = {
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        format: processedMetadata.format || 'unknown',
        size: processedBuffer.length,
        density: processedMetadata.density,
        hasAlpha: processedMetadata.hasAlpha,
      };

      this.logger.log(`Image processed successfully: ${originalMetadata.width}x${originalMetadata.height} -> ${metadata.width}x${metadata.height}`);

      return { buffer: processedBuffer, metadata };
    } catch (error) {
      this.logger.error('Failed to process image:', error);
      throw error;
    }
  }

  async generateThumbnail(
    buffer: Buffer,
    size: number = 300,
  ): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
    return this.processImage(buffer, {
      width: size,
      height: size,
      format: 'jpeg',
      quality: 70,
      resize: 'cover',
    });
  }

  async generateMultipleSizes(
    buffer: Buffer,
    sizes: { name: string; width: number; height?: number }[],
  ): Promise<{ [key: string]: { buffer: Buffer; metadata: ImageMetadata } }> {
    const results: { [key: string]: { buffer: Buffer; metadata: ImageMetadata } } = {};

    for (const size of sizes) {
      try {
        const result = await this.processImage(buffer, {
          width: size.width,
          height: size.height,
          format: 'jpeg',
          quality: 80,
          resize: 'cover',
        });
        results[size.name] = result;
      } catch (error) {
        this.logger.error(`Failed to generate size ${size.name}:`, error);
      }
    }

    return results;
  }

  async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!(metadata.width && metadata.height);
    } catch (error) {
      this.logger.error('Image validation failed:', error);
      return false;
    }
  }

  async getImageMetadata(buffer: Buffer): Promise<ImageMetadata | null> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      this.logger.error('Failed to get image metadata:', error);
      return null;
    }
  }
}


