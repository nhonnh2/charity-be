import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProgressUpdate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  campaignTitle: string;

  @Prop({ required: true })
  milestoneIndex: number; // Index của milestone trong campaign

  @Prop({ required: true, trim: true })
  milestoneTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  updatedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  updatedByName: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  progressPercentage: number;

  @Prop({ type: [String], default: [] })
  images: string[]; // URLs của hình ảnh tiến độ

  @Prop({ type: Object, required: false })
  metadata?: {
    workCompleted?: string;
    challengesFaced?: string;
    nextSteps?: string;
    resourcesUsed?: string;
  };

  @Prop({ type: Boolean, default: false })
  isVisible: boolean; // Có hiển thị công khai không

  createdAt: Date;
  updatedAt: Date;
}

export const ProgressUpdateSchema = SchemaFactory.createForClass(ProgressUpdate);

// Indexes
ProgressUpdateSchema.index({ campaignId: 1 });
ProgressUpdateSchema.index({ milestoneIndex: 1, campaignId: 1 });
ProgressUpdateSchema.index({ updatedBy: 1 });
ProgressUpdateSchema.index({ createdAt: -1 }); 