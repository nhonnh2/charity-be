import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProgressUpdate } from './entities/progress-update.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { User } from '../users/entities/user.entity';
import { CreateProgressUpdateDto, QueryProgressUpdatesDto } from './dto';
import { CampaignStatus, MilestoneStatus } from '../../shared/enums';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ProgressUpdate.name) private progressUpdateModel: Model<ProgressUpdate>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createDto: CreateProgressUpdateDto, userId: string): Promise<ProgressUpdate> {
    // Tìm campaign và validate
    const campaign = await this.campaignModel.findById(createDto.campaignId);
    if (!campaign) {
      throw new NotFoundException('Không tìm thấy chiến dịch');
    }

    // Kiểm tra quyền: chỉ creator mới được update progress
    if (campaign.creatorId.toString() !== userId) {
      throw new ForbiddenException('Chỉ có người tạo chiến dịch mới được cập nhật tiến độ');
    }

    // Kiểm tra campaign phải ở trạng thái IMPLEMENTATION
    if (campaign.status !== CampaignStatus.IMPLEMENTATION) {
      throw new BadRequestException('Chỉ có thể cập nhật tiến độ khi chiến dịch đang trong giai đoạn triển khai');
    }

    // Validate milestone
    if (createDto.milestoneIndex >= campaign.milestones.length) {
      throw new BadRequestException('Chỉ số milestone không hợp lệ');
    }

    const milestone = campaign.milestones[createDto.milestoneIndex];
    if (milestone.status !== MilestoneStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể cập nhật tiến độ cho milestone đang thực hiện');
    }

    // Lấy thông tin user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    // Tạo progress update
    const progressData = {
      ...createDto,
      campaignId: new Types.ObjectId(createDto.campaignId),
      campaignTitle: campaign.title,
      milestoneTitle: milestone.title,
      updatedBy: new Types.ObjectId(userId),
      updatedByName: user.name,
      metadata: {
        workCompleted: createDto.workCompleted,
        challengesFaced: createDto.challengesFaced,
        nextSteps: createDto.nextSteps,
        resourcesUsed: createDto.resourcesUsed,
      }
    };

    const progressUpdate = new this.progressUpdateModel(progressData);
    const savedUpdate = await progressUpdate.save();

    // Cập nhật progress percentage và count trong milestone
    await this.updateMilestoneProgress(
      createDto.campaignId, 
      createDto.milestoneIndex, 
      createDto.progressPercentage
    );

    return savedUpdate;
  }

  async findAll(queryDto: QueryProgressUpdatesDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = queryDto;
    
    // Build query
    const query: any = {};
    
    if (filters.campaignId) {
      query.campaignId = new Types.ObjectId(filters.campaignId);
    }
    if (filters.milestoneIndex !== undefined) {
      query.milestoneIndex = filters.milestoneIndex;
    }
    if (filters.updatedBy) {
      query.updatedBy = new Types.ObjectId(filters.updatedBy);
    }
    if (filters.isVisible !== undefined) {
      query.isVisible = filters.isVisible;
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query với pagination
    const skip = (page - 1) * limit;
    const [updates, total] = await Promise.all([
      this.progressUpdateModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('campaignId', 'title status')
        .populate('updatedBy', 'name avatar')
        .exec(),
      this.progressUpdateModel.countDocuments(query)
    ]);

    return {
      data: updates,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByCampaign(campaignId: string, milestoneIndex?: number) {
    const query: any = { campaignId: new Types.ObjectId(campaignId) };
    
    if (milestoneIndex !== undefined) {
      query.milestoneIndex = milestoneIndex;
    }

    return this.progressUpdateModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('updatedBy', 'name avatar')
      .exec();
  }

  async findOne(id: string): Promise<ProgressUpdate> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const update = await this.progressUpdateModel
      .findById(id)
      .populate('campaignId', 'title status creatorId')
      .populate('updatedBy', 'name avatar')
      .exec();

    if (!update) {
      throw new NotFoundException('Không tìm thấy cập nhật tiến độ');
    }

    return update;
  }

  async remove(id: string, userId: string): Promise<void> {
    const update = await this.findOne(id);

    // Kiểm tra quyền: chỉ người tạo update hoặc creator campaign mới được xóa
    const campaign = await this.campaignModel.findById(update.campaignId);
    if (update.updatedBy.toString() !== userId && campaign?.creatorId.toString() !== userId) {
      const user = await this.userModel.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException('Không có quyền xóa cập nhật tiến độ này');
      }
    }

    await this.progressUpdateModel.findByIdAndDelete(id);
  }

  // Private helper methods
  private async updateMilestoneProgress(campaignId: string, milestoneIndex: number, progressPercentage: number): Promise<void> {
    await this.campaignModel.updateOne(
      { _id: new Types.ObjectId(campaignId) },
      {
        $set: {
          [`milestones.${milestoneIndex}.progressPercentage`]: progressPercentage,
        },
        $inc: {
          [`milestones.${milestoneIndex}.progressUpdatesCount`]: 1,
        }
      }
    );
  }

  // Get milestone progress summary
  async getMilestoneProgressSummary(campaignId: string, milestoneIndex: number) {
    const [campaign, updates] = await Promise.all([
      this.campaignModel.findById(campaignId),
      this.progressUpdateModel
        .find({ 
          campaignId: new Types.ObjectId(campaignId),
          milestoneIndex 
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('updatedBy', 'name avatar')
        .exec()
    ]);

    if (!campaign || milestoneIndex >= campaign.milestones.length) {
      throw new NotFoundException('Không tìm thấy milestone');
    }

    const milestone = campaign.milestones[milestoneIndex];

    return {
      milestone: {
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        progressPercentage: milestone.progressPercentage,
        progressUpdatesCount: milestone.progressUpdatesCount,
        targetAmount: milestone.targetAmount,
        disbursedAmount: milestone.disbursedAmount,
        dueDate: milestone.dueDate,
      },
      recentUpdates: updates,
      progressHistory: await this.getProgressHistory(campaignId, milestoneIndex),
    };
  }

  private async getProgressHistory(campaignId: string, milestoneIndex: number) {
    return this.progressUpdateModel
      .find({ 
        campaignId: new Types.ObjectId(campaignId),
        milestoneIndex 
      })
      .select('progressPercentage createdAt updatedByName')
      .sort({ createdAt: 1 })
      .exec();
  }
} 