import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostLikeDocument = PostLike & Document;

@Schema({ timestamps: true })
export class PostLike extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, index: true })
  likedAt: Date;


  createdAt: Date;
  updatedAt: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// Compound unique index - một user chỉ có thể like một post một lần
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Index for performance queries
PostLikeSchema.index({ postId: 1, likedAt: -1 }); // Get likes for a post, sorted by newest
PostLikeSchema.index({ userId: 1, likedAt: -1 }); // Get user's liked posts, sorted by newest
PostLikeSchema.index({ likedAt: -1 }); // Global likes timeline

