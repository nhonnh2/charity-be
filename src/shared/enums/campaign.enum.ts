export enum CampaignType {
  NORMAL = 'normal',
  EMERGENCY = 'emergency'
}

export enum FundingType {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible'
}

export enum CampaignStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected', 
  FUNDRAISING = 'fundraising',    // Đang quyên góp
  IMPLEMENTATION = 'implementation', // Đang triển khai
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ACTIVE = 'active'
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ReviewPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum MilestoneStatus {
  PENDING = 'pending',              // Chờ bắt đầu
  ACTIVE = 'active',                // Đang thực hiện
  COMPLETED = 'completed',          // Hoàn thành
  VERIFIED = 'verified'             // Đã xác minh (sau expense report)
}

export enum DisbursementStatus {
  PENDING = 'pending',              // Chờ giải ngân
  APPROVED = 'approved',            // Đã duyệt
  DISBURSED = 'disbursed',          // Đã giải ngân
  REJECTED = 'rejected'             // Từ chối giải ngân
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DIGITAL_WALLET = 'digital_wallet',
  CASH = 'cash'
}

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
} 