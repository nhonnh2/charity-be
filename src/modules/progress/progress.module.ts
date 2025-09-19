import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ProgressUpdate, ProgressUpdateSchema } from './entities/progress-update.entity';
import { Campaign, CampaignSchema } from '../campaigns/entities/campaign.entity';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgressUpdate.name, schema: ProgressUpdateSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {} 