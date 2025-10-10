import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../shared/enums/error-codes.enum';

/**
 * Base exception class that includes error_code for client-side error message mapping
 * 
 * Usage:
 * throw new BusinessException(
 *   CampaignErrorCode.NOT_FOUND,
 *   'Campaign with ID 123 not found in database',
 *   HttpStatus.NOT_FOUND
 * );
 * 
 * Response format:
 * {
 *   statusCode: 404,
 *   error_code: 'CAMPAIGN_NOT_FOUND',
 *   message: 'Campaign with ID 123 not found in database',
 *   timestamp: '2025-10-10T10:30:00.000Z',
 *   path: '/api/campaigns/123'
 * }
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        error_code: errorCode,
        message,
      },
      status,
    );
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}

