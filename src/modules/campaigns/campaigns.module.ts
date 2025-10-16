import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignFollowsController } from './campaign-follows.controller';
import { CategoriesController } from './categories.controller';
import { StatisticsController } from './statistics.controller';
import { Campaign, CampaignSchema } from './entities/campaign.entity';
import { CampaignFollow, CampaignFollowSchema } from './entities/campaign-follow.entity';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignFollow.name, schema: CampaignFollowSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    CampaignsController,
    CampaignFollowsController,
    CategoriesController,
    StatisticsController
  ],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {} 