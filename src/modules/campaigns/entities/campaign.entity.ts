import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CampaignType, FundingType, CampaignStatus, ReviewStatus, MilestoneStatus, CampaignCategory } from '../../../shared/enums';

// Interface cho milestone
export interface Milestone {
  title: string;
  description: string;
  targetAmount: number;
  durationDays: number; // Thời gian dự kiến (số ngày)
  status: MilestoneStatus;
  startedAt?: Date;
  dueDate?: Date; // Sẽ được set sau khi campaign được approve
  completedAt?: Date; // Sẽ được update khi milestone hoàn thành
  verifiedAt?: Date;
  disbursedAmount?: number;
  actualSpending?: number;
  progressPercentage: number;
  progressUpdatesCount: number;
  documents: FileObject[]; // Nhiều tài liệu cho kế hoạch
}

// Interface cho file object (chứa cả id và url)
export interface FileObject {
  id: string;    // ID của file trong collection media
  url: string;   // URL của file
  name: string;   // Tên file
}

// Interface cho attachment (backward compatibility)
export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

// Interface cho review
export interface Review {
  reviewerId: Types.ObjectId;
  reviewerName: string;
  status: ReviewStatus;
  comments?: string;
  reviewedAt?: Date;
  priority: number; // Được tính từ review fee
}

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  description: string;

  @Prop({ 
    type: String, 
    enum: Object.values(CampaignType),
    required: true 
  })
  type: CampaignType;

  @Prop({ 
    type: String, 
    enum: Object.values(FundingType),
    required: true 
  })
  fundingType: FundingType;

  @Prop({ 
    type: String, 
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.PENDING_REVIEW 
  })
  status: CampaignStatus;

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

  @Prop({ type: Number, required: true, min: 1000 })
  targetAmount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  currentAmount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  donorCount: number;

  @Prop({ type: Number, required: true, min: 0 })
  reviewFee: number; // Phí duyệt để thu hút reviewer

  @Prop({ 
    type: String, 
    enum: Object.values(CampaignCategory),
    required: false 
  })
  category?: CampaignCategory;

  @Prop({ type: [String], default: [] })
  tags: string[];


  @Prop({ type: [Object], default: [] })
  milestones: Milestone[];

  @Prop({ type: Object, required: false })
  review?: Review;

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ type: Number, required: false, min: 1, max: 365 })
  fundraisingDays?: number; // Số ngày kêu gọi quyên góp

  @Prop({ required: false })
  approvedAt?: Date;

  @Prop({ required: false })
  completedAt?: Date;

  @Prop({ type: String, required: false })
  rejectionReason?: string;

  @Prop({ type: Boolean, default: true })
  isFollowing: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Number, default: 0 })
  shareCount: number;

  @Prop({ type: Number, default: 0 })
  followersCount: number; // Số người quan tâm/follow chiến dịch

  @Prop({ type: Object, required: false })
  coverImage?: FileObject; // Ảnh bìa đại diện cho chiến dịch

  @Prop({ type: [Object], default: [] })
  gallery: FileObject[]; // Danh sách ảnh của chiến dịch

  // Metadata cho blockchain integration
  @Prop({ type: String, required: false })
  blockchainTxHash?: string;

  @Prop({ type: String, required: false })
  smartContractAddress?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Index cho performance
CampaignSchema.index({ creatorId: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ type: 1 });
CampaignSchema.index({ category: 1 });
CampaignSchema.index({ createdAt: -1 });
CampaignSchema.index({ reviewFee: -1 }); // Để sort theo review fee 