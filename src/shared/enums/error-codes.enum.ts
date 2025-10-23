/**
 * Error codes to be used by client for multi-language error messages
 * These codes should match the error codes defined in the client application
 * 
 * PRINCIPLES:
 * - Only include errors for BUSINESS LOGIC, not simple validation (use class-validator for that)
 * - Each error code should represent ONE specific error scenario
 * - Keep it focused on what client needs to display different messages
 * 
 * Server will return:
 * - error_code: for client to map to localized messages
 * - message: for developer debugging (can be detailed technical message)
 */

// ========================================
// COMMON ERRORS (COMMON_*)
// ========================================
export enum CommonErrorCode {
  INTERNAL_SERVER_ERROR = 'COMMON_INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'COMMON_VALIDATION_ERROR',
  UNAUTHORIZED = 'COMMON_UNAUTHORIZED',
  FORBIDDEN = 'COMMON_FORBIDDEN',
  NOT_FOUND = 'COMMON_NOT_FOUND',
  BAD_REQUEST = 'COMMON_BAD_REQUEST',
  TIMEOUT = 'COMMON_TIMEOUT',
}

// ========================================
// CAMPAIGN ERRORS (CAMPAIGN_*)
// ========================================
export enum CampaignErrorCode {
  // Not found / Access
  NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  NOT_OWNER = 'CAMPAIGN_NOT_OWNER',
  
  // Status / State errors
  CANNOT_EDIT = 'CAMPAIGN_CANNOT_EDIT',
  CANNOT_DELETE = 'CAMPAIGN_CANNOT_DELETE',
  INVALID_STATUS_TRANSITION = 'CAMPAIGN_INVALID_STATUS_TRANSITION',
  
  // Creation limits
  ACTIVE_LIMIT_EXCEEDED = 'CAMPAIGN_ACTIVE_LIMIT_EXCEEDED',
  CREATOR_NOT_FOUND = 'CAMPAIGN_CREATOR_NOT_FOUND',
  
  // Emergency campaign specific
  EMERGENCY_REPUTATION_TOO_LOW = 'CAMPAIGN_EMERGENCY_REPUTATION_TOO_LOW',
  EMERGENCY_MULTIPLE_MILESTONES = 'CAMPAIGN_EMERGENCY_MULTIPLE_MILESTONES',
  
  // Milestone business logic
  MILESTONE_BUDGET_MISMATCH = 'CAMPAIGN_MILESTONE_BUDGET_MISMATCH',
  MILESTONE_DURATION_INVALID = 'CAMPAIGN_MILESTONE_DURATION_INVALID',
  
  // Date logic
  END_DATE_BEFORE_START = 'CAMPAIGN_END_DATE_BEFORE_START',
  
  // Review process
  REVIEWER_NOT_FOUND = 'CAMPAIGN_REVIEWER_NOT_FOUND',
  HAS_DONATIONS = 'CAMPAIGN_HAS_DONATIONS', // Cannot delete/cancel campaign with donations
}

// ========================================
// MEDIA/UPLOAD ERRORS (MEDIA_*)
// ========================================
export enum MediaErrorCode {
  NOT_FOUND = 'MEDIA_NOT_FOUND',
  UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',
  FILE_TOO_LARGE = 'MEDIA_FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'MEDIA_INVALID_FILE_TYPE',
  PROCESSING_FAILED = 'MEDIA_PROCESSING_FAILED',
  UPLOAD_LIMIT_EXCEEDED = 'MEDIA_UPLOAD_LIMIT_EXCEEDED', // Keep for future use
}

// ========================================
// AUTH ERRORS (AUTH_*)
// ========================================
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  OAUTH_FAILED = 'AUTH_OAUTH_FAILED', // For OAuth specific failures
}

// ========================================
// USER ERRORS (USER_*)
// ========================================
export enum UserErrorCode {
  NOT_FOUND = 'USER_NOT_FOUND',
  BANNED = 'USER_BANNED',
  INSUFFICIENT_REPUTATION = 'USER_INSUFFICIENT_REPUTATION',
}

// ========================================
// PAYMENT/TRANSACTION ERRORS (PAYMENT_*)
// ========================================
export enum PaymentErrorCode {
  FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_BALANCE = 'PAYMENT_INSUFFICIENT_BALANCE',
  INVALID_AMOUNT = 'PAYMENT_INVALID_AMOUNT',
  TRANSACTION_NOT_FOUND = 'PAYMENT_TRANSACTION_NOT_FOUND',
  ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
}

// ========================================
// DONATION ERRORS (DONATION_*)
// ========================================
export enum DonationErrorCode {
  FAILED = 'DONATION_FAILED',
  AMOUNT_TOO_LOW = 'DONATION_AMOUNT_TOO_LOW',
  CAMPAIGN_ENDED = 'DONATION_CAMPAIGN_ENDED',
  CAMPAIGN_NOT_ACTIVE = 'DONATION_CAMPAIGN_NOT_ACTIVE',
}

// ========================================
// REVIEW/VERIFICATION ERRORS (REVIEW_*)
// ========================================
export enum ReviewErrorCode {
  ALREADY_SUBMITTED = 'REVIEW_ALREADY_SUBMITTED',
  DOCUMENTS_INCOMPLETE = 'REVIEW_DOCUMENTS_INCOMPLETE',
  IDENTITY_VERIFICATION_FAILED = 'REVIEW_IDENTITY_VERIFICATION_FAILED',
  FEE_PAYMENT_FAILED = 'REVIEW_FEE_PAYMENT_FAILED',
}

// ========================================
// POSTS/SOCIAL FEED ERRORS (POST_*)
// ========================================
export enum PostErrorCode {
  // Not found / Access
  NOT_FOUND = 'POST_NOT_FOUND',
  NOT_OWNER = 'POST_NOT_OWNER',
  
  // Content validation
  CONTENT_REQUIRED = 'POST_CONTENT_REQUIRED',
  CONTENT_TOO_LONG = 'POST_CONTENT_TOO_LONG',
  INVALID_MEDIA_TYPE = 'POST_INVALID_MEDIA_TYPE',
  
  // Interaction errors
  ALREADY_LIKED = 'POST_ALREADY_LIKED',
  NOT_LIKED = 'POST_NOT_LIKED',
  ALREADY_SHARED = 'POST_ALREADY_SHARED',
  COMMENT_NOT_FOUND = 'POST_COMMENT_NOT_FOUND',
  
  // Permission errors
  CANNOT_EDIT = 'POST_CANNOT_EDIT',
  CANNOT_DELETE = 'POST_CANNOT_DELETE',
  PRIVATE_POST = 'POST_PRIVATE_POST',
  
  // Rate limiting
  POST_LIMIT_EXCEEDED = 'POST_POST_LIMIT_EXCEEDED',
  INTERACTION_LIMIT_EXCEEDED = 'POST_INTERACTION_LIMIT_EXCEEDED',
  
  // Campaign integration
  CAMPAIGN_NOT_FOUND = 'POST_CAMPAIGN_NOT_FOUND',
  CAMPAIGN_NOT_ACTIVE = 'POST_CAMPAIGN_NOT_ACTIVE',
}

// Union type of all error codes for type safety
export type ErrorCode =
  | CommonErrorCode
  | CampaignErrorCode
  | MediaErrorCode
  | AuthErrorCode
  | UserErrorCode
  | PaymentErrorCode
  | DonationErrorCode
  | ReviewErrorCode
  | PostErrorCode;
