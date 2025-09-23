import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type MediaDocument = Media & Document;

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export enum MediaProvider {
  GOOGLE_CLOUD = 'google_cloud',
  AZURE_BLOB = 'azure_blob',
  LOCAL = 'local',
}

export enum MediaStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Schema({ timestamps: true })
export class Media {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, enum: MediaType })
  type: MediaType;

  @Prop({ required: true, enum: MediaProvider })
  provider: MediaProvider;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  cloudPath: string;

  @Prop({ enum: MediaStatus, default: MediaStatus.UPLOADING })
  status: MediaStatus;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    quality?: string;
  };

  @Prop()
  tags?: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop()
  description?: string;

  @Prop()
  altText?: string;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  uploadedAt?: Date;

  @Prop()
  processedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop()
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Indexes for better query performance
MediaSchema.index({ userId: 1, status: 1 });
MediaSchema.index({ provider: 1, cloudPath: 1 });
MediaSchema.index({ type: 1, status: 1 });
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isPublic: 1, status: 1 });
