import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Interface cho file object (giống Campaign)
export interface FileObject {
  id: string;    // ID của file trong collection media
  url: string;   // URL của file
  name: string;  // Tên file
}

export type PostDocument = Post & Document;

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  MIXED = 'mixed',
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;

  @Prop({ 
    type: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      avatar: { type: String, required: false, trim: true },
      reputation: { type: Number, default: 0, min: 0 }
    },
    required: true
  })
  creator: {
    name: string;
    email: string;
    avatar?: string;
    reputation: number;
  };

  @Prop({ type: Object, required: true })
  content: {
    text?: string;
    images: FileObject[];
    videos: FileObject[];
    links: Array<{
      url: string;
      title?: string;
      description?: string;
      thumbnail?: string;
      domain?: string;
    }>;
  };

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: false })
  campaignId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
  };

  @Prop({ 
    type: String, 
    enum: Object.values(PostVisibility), 
    default: PostVisibility.PUBLIC 
  })
  visibility: PostVisibility;


  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions: Types.ObjectId[];

  @Prop({ type: Object, required: false })
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
    city?: string;
    country?: string;
  };

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Index cho performance
PostSchema.index({ creatorId: 1 });
PostSchema.index({ campaignId: 1 });
PostSchema.index({ type: 1 });
PostSchema.index({ visibility: 1 });
PostSchema.index({ isDeleted: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ mentions: 1 });
PostSchema.index({ 'location.coordinates': '2dsphere' });
