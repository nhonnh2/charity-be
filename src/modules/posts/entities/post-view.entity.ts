import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostViewDocument = PostView & Document;

@Schema({ timestamps: true })
export class PostView extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;

  // User can be null for anonymous views
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  // Anonymous tracking
  @Prop({ type: String, required: false, index: true })
  sessionId?: string;

  // IP address for analytics
  @Prop({ type: String, required: false })
  ipAddress?: string;

  // User agent for device/browser analytics
  @Prop({ type: String, required: false })
  userAgent?: string;

  // Referrer for traffic source tracking
  @Prop({ type: String, required: false })
  referrer?: string;

  // View duration in seconds (if tracked)
  @Prop({ type: Number, required: false })
  duration?: number;

  // View source (web, mobile, api, etc.)
  @Prop({ type: String, default: 'web' })
  source: string;

  // Geographic data (if available)
  @Prop({ type: Object, required: false })
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };

  @Prop({ type: Date, default: Date.now, index: true })
  viewedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PostViewSchema = SchemaFactory.createForClass(PostView);

// Indexes for performance and analytics
PostViewSchema.index({ postId: 1, viewedAt: -1 }); // Get views for a post, sorted by newest
PostViewSchema.index({ userId: 1, viewedAt: -1 }); // Get user's viewed posts
PostViewSchema.index({ sessionId: 1, viewedAt: -1 }); // Track anonymous user sessions
PostViewSchema.index({ viewedAt: -1 }); // Global views timeline
PostViewSchema.index({ source: 1, viewedAt: -1 }); // Filter by source
PostViewSchema.index({ 'location.country': 1, viewedAt: -1 }); // Geographic analytics

// Compound index to prevent duplicate views from same user/session
PostViewSchema.index({ postId: 1, userId: 1 }, { unique: true, sparse: true });
PostViewSchema.index({ postId: 1, sessionId: 1 }, { unique: true, sparse: true });

