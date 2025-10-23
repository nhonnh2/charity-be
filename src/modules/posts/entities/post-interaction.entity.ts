import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostInteractionDocument = PostInteraction & Document;

export enum InteractionType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  VIEW = 'view',
}

@Schema({ timestamps: true })
export class PostInteraction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(InteractionType), 
    required: true 
  })
  type: InteractionType;

  @Prop({ type: Object, required: false })
  commentData?: {
    content: string;
    parentCommentId?: Types.ObjectId;
    mentions?: Types.ObjectId[];
  };

  @Prop({ type: Object, required: false })
  shareData?: {
    shareText?: string;
    shareType: 'repost' | 'quote';
    originalPostId?: Types.ObjectId;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const PostInteractionSchema = SchemaFactory.createForClass(PostInteraction);

// Compound index để đảm bảo unique interaction per user per post per type
PostInteractionSchema.index({ postId: 1, userId: 1, type: 1 }, { unique: true });

// Index cho performance
PostInteractionSchema.index({ postId: 1 });
PostInteractionSchema.index({ userId: 1 });
PostInteractionSchema.index({ type: 1 });
PostInteractionSchema.index({ createdAt: -1 });
PostInteractionSchema.index({ 'commentData.parentCommentId': 1 });
