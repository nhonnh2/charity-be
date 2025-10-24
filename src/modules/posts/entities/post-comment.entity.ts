import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostCommentDocument = PostComment & Document;

@Schema({ timestamps: true })
export class PostComment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 2000 })
  content: string;

  // Support for nested comments (replies)
  @Prop({ type: Types.ObjectId, ref: 'PostComment', required: false, index: true })
  parentCommentId?: Types.ObjectId;

  // Mentions in comment
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions: Types.ObjectId[];

  // Comment engagement
  @Prop({ type: Object, default: {} })
  engagement: {
    likesCount: number;
    repliesCount: number;
  };

  // Soft delete support
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  // Edit history support
  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date, required: false })
  editedAt?: Date;

  // Optional: Support for comment reactions
  @Prop({ type: Object, default: {} })
  reactions: {
    like: number;
    love: number;
    laugh: number;
    angry: number;
    sad: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

// Indexes for performance
PostCommentSchema.index({ postId: 1, createdAt: -1 }); // Get comments for a post, sorted by newest
PostCommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 }); // Get top-level comments
PostCommentSchema.index({ parentCommentId: 1, createdAt: -1 }); // Get replies for a comment
PostCommentSchema.index({ userId: 1, createdAt: -1 }); // Get user's comments
PostCommentSchema.index({ postId: 1, isDeleted: 1 }); // Filter out deleted comments
PostCommentSchema.index({ mentions: 1, createdAt: -1 }); // Get comments mentioning a user

