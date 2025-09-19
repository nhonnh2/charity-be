import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';

// Loại bỏ type vì không được phép thay đổi loại campaign sau khi tạo
export class UpdateCampaignDto extends PartialType(
  OmitType(CreateCampaignDto, ['type', 'creatorReputation'] as const)
) {} 