import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostShareDocument = PostShare & Document;

export enum ShareType {
  REPOST = 'repost',
  QUOTE = 'quote',
}

@Schema({ timestamps: true })
export class PostShare extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // Share type: repost (just share) or quote (share with comment)
  @Prop({ 
    type: String, 
    enum: Object.values(ShareType), 
    default: ShareType.REPOST 
  })
  shareType: ShareType;

  // Optional text when sharing (for quote shares)
  @Prop({ type: String, trim: true, maxlength: 1000 })
  shareText?: string;

  // Reference to original post (for tracking share chains)
  @Prop({ type: Types.ObjectId, ref: 'Post', required: false, index: true })
  originalPostId?: Types.ObjectId;

  // Share engagement
  @Prop({ type: Object, default: {} })
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };

  // Privacy settings for the share
  @Prop({ 
    type: String, 
    enum: ['public', 'followers', 'private'], 
    default: 'public' 
  })
  visibility: string;

  // Track share source (web, mobile, api, etc.)
  @Prop({ type: String, default: 'web' })
  source: string;

  @Prop({ type: Date, default: Date.now, index: true })
  sharedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PostShareSchema = SchemaFactory.createForClass(PostShare);

// Indexes for performance
PostShareSchema.index({ postId: 1, sharedAt: -1 }); // Get shares for a post, sorted by newest
PostShareSchema.index({ userId: 1, sharedAt: -1 }); // Get user's shares, sorted by newest
PostShareSchema.index({ originalPostId: 1, sharedAt: -1 }); // Track share chains
PostShareSchema.index({ shareType: 1, sharedAt: -1 }); // Filter by share type
PostShareSchema.index({ visibility: 1, sharedAt: -1 }); // Filter by visibility
PostShareSchema.index({ sharedAt: -1 }); // Global shares timeline

