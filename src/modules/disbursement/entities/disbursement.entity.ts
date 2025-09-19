import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DisbursementStatus } from '../../../shared/enums';

// Interface cho disbursement details
export interface DisbursementDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transferMethod: 'bank_transfer' | 'digital_wallet' | 'cash';
  transactionId?: string;
  transferDate?: Date;
  transferFee?: number;
}

@Schema({ timestamps: true })
export class Disbursement extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  campaignTitle: string;

  @Prop({ required: true })
  milestoneIndex: number;

  @Prop({ required: true, trim: true })
  milestoneTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId; // Campaign creator

  @Prop({ required: true, trim: true })
  requestedByName: string;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number; // Số tiền yêu cầu giải ngân

  @Prop({ type: Number, default: 0 })
  fee: number; // Phí giải ngân

  @Prop({ type: Number })
  netAmount: number; // Số tiền thực giải ngân (amount - fee)

  @Prop({ 
    type: String, 
    enum: Object.values(DisbursementStatus),
    default: DisbursementStatus.PENDING 
  })
  status: DisbursementStatus;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  purpose: string; // Mục đích sử dụng tiền

  @Prop({ type: Object, required: true })
  disbursementDetails: DisbursementDetails;

  @Prop({ type: Types.ObjectId, ref: 'ExpenseReport', required: false })
  expenseReportId?: Types.ObjectId; // Link tới expense report (nếu có)

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approvedBy?: Types.ObjectId;

  @Prop({ required: false, trim: true })
  approvedByName?: string;

  @Prop({ required: false })
  approvedAt?: Date;

  @Prop({ required: false })
  disbursedAt?: Date;

  @Prop({ required: false, trim: true })
  approvalComments?: string;

  @Prop({ required: false, trim: true })
  rejectionReason?: string;

  @Prop({ required: false })
  requestedAt?: Date;

  @Prop({ type: [String], default: [] })
  supportingDocuments: string[]; // URLs tài liệu hỗ trợ

  @Prop({ type: Boolean, default: false })
  isUrgent: boolean; // Giải ngân khẩn cấp

  @Prop({ type: Number, min: 1, max: 5, required: false })
  priorityLevel?: number; // Mức độ ưu tiên

  @Prop({ required: false, trim: true })
  notes?: string; // Ghi chú nội bộ

  @Prop({ type: Boolean, default: false })
  requiresAdditionalApproval: boolean; // Cần approval thêm

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  additionalApprovers: Types.ObjectId[]; // Danh sách người cần approve thêm

  createdAt: Date;
  updatedAt: Date;
}

export const DisbursementSchema = SchemaFactory.createForClass(Disbursement);

// Indexes
DisbursementSchema.index({ campaignId: 1 });
DisbursementSchema.index({ milestoneIndex: 1, campaignId: 1 });
DisbursementSchema.index({ requestedBy: 1 });
DisbursementSchema.index({ status: 1 });
DisbursementSchema.index({ isUrgent: 1, priorityLevel: -1 });
DisbursementSchema.index({ requestedAt: -1 });
DisbursementSchema.index({ disbursedAt: -1 });

// Compound indexes
DisbursementSchema.index({ status: 1, isUrgent: -1, priorityLevel: -1 }); 