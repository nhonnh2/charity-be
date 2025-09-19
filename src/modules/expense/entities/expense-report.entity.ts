import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Interface cho expense item
export interface ExpenseItem {
  category: string; // Danh mục chi tiêu
  description: string;
  amount: number;
  date: Date;
  receipt?: string; // URL của hóa đơn
  vendor?: string; // Nhà cung cấp
}

// Interface cho attached document
export interface ExpenseDocument {
  fileName: string;
  fileUrl: string;
  fileType: string; // receipt, invoice, contract, photo, etc.
  description?: string;
  uploadedAt: Date;
}

@Schema({ timestamps: true })
export class ExpenseReport extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  campaignTitle: string;

  @Prop({ required: true })
  milestoneIndex: number;

  @Prop({ required: true, trim: true })
  milestoneTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  reportedByName: string;

  @Prop({ type: Number, required: true, min: 0 })
  budgetAllocated: number; // Ngân sách được phân bổ cho milestone

  @Prop({ type: Number, required: true, min: 0 })
  totalSpent: number; // Tổng chi tiêu thực tế

  @Prop({ type: Number })
  variance: number; // Chênh lệch (allocated - spent)

  @Prop({ required: true, trim: true, maxlength: 3000 })
  description: string; // Mô tả chi tiết về cách sử dụng tiền

  @Prop({ type: [Object], default: [] })
  expenseItems: ExpenseItem[]; // Chi tiết từng khoản chi

  @Prop({ type: [Object], default: [] })
  attachments: ExpenseDocument[]; // Tài liệu đính kèm

  @Prop({ required: true, trim: true, maxlength: 1000 })
  achievements: string; // Những gì đã đạt được

  @Prop({ required: false, trim: true, maxlength: 1000 })
  challenges?: string; // Khó khăn gặp phải

  @Prop({ required: false, trim: true, maxlength: 1000 })
  lessonsLearned?: string; // Bài học rút ra

  @Prop({ 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'requires_revision'],
    default: 'pending' 
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  reviewedBy?: Types.ObjectId;

  @Prop({ required: false, trim: true })
  reviewedByName?: string;

  @Prop({ required: false })
  reviewedAt?: Date;

  @Prop({ required: false, trim: true })
  reviewComments?: string;

  @Prop({ type: Number, min: 1, max: 5, required: false })
  reviewScore?: number; // Điểm đánh giá từ 1-5

  @Prop({ type: Boolean, default: false })
  isPublic: boolean; // Có công khai báo cáo không

  @Prop({ required: false })
  submittedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ExpenseReportSchema = SchemaFactory.createForClass(ExpenseReport);

// Indexes
ExpenseReportSchema.index({ campaignId: 1 });
ExpenseReportSchema.index({ milestoneIndex: 1, campaignId: 1 });
ExpenseReportSchema.index({ reportedBy: 1 });
ExpenseReportSchema.index({ status: 1 });
ExpenseReportSchema.index({ submittedAt: -1 }); 