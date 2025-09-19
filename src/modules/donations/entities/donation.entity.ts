import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod, DonationStatus } from '../../../shared/enums';

// Interface cho transaction details
export interface TransactionDetails {
  transactionId?: string; // ID giao dịch từ payment gateway
  paymentGateway?: string; // VNPay, MoMo, etc.
  bankName?: string;
  accountNumber?: string;
  transactionDate?: Date;
  confirmationCode?: string;
}

@Schema({ timestamps: true })
export class Donation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  campaignTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  donorId?: Types.ObjectId; // Null nếu anonymous

  @Prop({ required: false, trim: true })
  donorName?: string; // Tên người quyên góp (có thể anonymous)

  @Prop({ required: false, trim: true })
  donorEmail?: string;

  @Prop({ type: Number, required: true, min: 1000 })
  amount: number; // Số tiền quyên góp (VNĐ)

  @Prop({ 
    type: String, 
    enum: Object.values(PaymentMethod),
    required: true 
  })
  paymentMethod: PaymentMethod;

  @Prop({ 
    type: String, 
    enum: Object.values(DonationStatus),
    default: DonationStatus.PENDING 
  })
  status: DonationStatus;

  @Prop({ type: Object, required: false })
  transactionDetails?: TransactionDetails;

  @Prop({ required: false, trim: true, maxlength: 500 })
  message?: string; // Lời nhắn của donor

  @Prop({ type: Boolean, default: false })
  isAnonymous: boolean; // Quyên góp ẩn danh

  @Prop({ type: Boolean, default: true })
  isRecurring: boolean; // Có cho phép quyên góp định kỳ

  @Prop({ required: false })
  processedAt?: Date; // Thời gian xử lý thành công

  @Prop({ required: false })
  refundedAt?: Date; // Thời gian hoàn tiền (nếu có)

  @Prop({ required: false, trim: true })
  refundReason?: string;

  @Prop({ type: Number, default: 0 })
  fee: number; // Phí giao dịch

  @Prop({ type: Number })
  netAmount: number; // Số tiền thực nhận (amount - fee)

  @Prop({ required: false, trim: true })
  notes?: string; // Ghi chú nội bộ

  @Prop({ type: String, required: false })
  receiptUrl?: string; // URL biên lai quyên góp

  @Prop({ type: Boolean, default: false })
  isTaxDeductible: boolean; // Có được khấu trừ thuế không

  createdAt: Date;
  updatedAt: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);

// Indexes
DonationSchema.index({ campaignId: 1 });
DonationSchema.index({ donorId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ paymentMethod: 1 });
DonationSchema.index({ amount: -1 }); // Sort by amount desc
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ processedAt: -1 });

// Compound indexes
DonationSchema.index({ campaignId: 1, status: 1 });
DonationSchema.index({ donorId: 1, createdAt: -1 }); 