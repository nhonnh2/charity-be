import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CampaignFollow extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  userName: string; // Denormalized để tránh populate

  @Prop({ required: true, trim: true })
  campaignTitle: string; // Denormalized để tránh populate

  @Prop({ type: Boolean, default: true })
  isFollowing: boolean; // Có thể dùng để soft delete

  @Prop({ type: Date, default: Date.now })
  followedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignFollowSchema = SchemaFactory.createForClass(CampaignFollow);

// Compound index để đảm bảo unique follow per user per campaign
CampaignFollowSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

// Indexes cho performance
CampaignFollowSchema.index({ campaignId: 1, isFollowing: 1 });
CampaignFollowSchema.index({ userId: 1, isFollowing: 1 });
CampaignFollowSchema.index({ followedAt: -1 });
