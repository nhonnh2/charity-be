import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './entities/campaign.entity';
import { CampaignFollow } from './entities/campaign-follow.entity';
import { User } from '../users/entities/user.entity';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto, FollowCampaignDto, UnfollowCampaignDto, CampaignFollowResponseDto, CampaignFollowersQueryDto } from './dto';
import { CampaignType, CampaignStatus, ReviewStatus, CampaignErrorCode, CommonErrorCode } from '../../shared/enums';
import { BusinessException } from '../../core/exceptions';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CampaignFollow.name) private campaignFollowModel: Model<CampaignFollow>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<Campaign> {
    // Tìm thông tin creator
    const creator = await this.userModel.findById(userId);
    if (!creator) {
      throw new BusinessException(
        CampaignErrorCode.CREATOR_NOT_FOUND,
        `Creator with ID ${userId} not found in database`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate business rules
    await this.validateCampaignCreation(createCampaignDto, creator);

    // Tạo campaign data
    const campaignData: any = {
      ...createCampaignDto,
      creatorId: new Types.ObjectId(userId),
      creatorName: creator.name,
      status: CampaignStatus.PENDING_REVIEW,
    };


    // Xử lý milestones cho emergency campaign (chỉ 1 giai đoạn)
    if (createCampaignDto.type === CampaignType.EMERGENCY) {
      // Sử dụng milestone data từ request body nếu có, nếu không thì tạo default
      if (createCampaignDto.milestones && createCampaignDto.milestones.length > 0) {
        campaignData.milestones = createCampaignDto.milestones.map(milestone => ({
          title: milestone.title,
          description: milestone.description,
          budget: milestone.budget,
          durationDays: milestone.durationDays,
          status: 'pending',
          progressPercentage: 0,
          progressUpdatesCount: 0,
          documents: milestone.documents || []
        }));
      } else {
        // Fallback nếu không có milestone data
        campaignData.milestones = [{
          title: 'Giải ngân toàn bộ',
          description: 'Giải ngân toàn bộ số tiền cho chiến dịch khẩn cấp',
          budget: createCampaignDto.targetAmount,
          durationDays: 30, // 30 ngày cho emergency campaign
          status: 'pending',
          progressPercentage: 0,
          progressUpdatesCount: 0,
          documents: []
        }] as any;
      }
    }

    const campaign = new this.campaignModel(campaignData);
    const savedCampaign = await campaign.save();

    // Cập nhật thống kê creator
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalCampaignsCreated: 1 }
    });

    return savedCampaign;
  }

  async findAll(queryDto: QueryCampaignsDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = queryDto;
    
    // Build query
    const query: any = {};
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { creatorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (filters.type) query.type = filters.type;
    if (filters.fundingType) query.fundingType = filters.fundingType;
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.creatorId) query.creatorId = new Types.ObjectId(filters.creatorId);
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    if (filters.tag) query.tags = { $in: [filters.tag] };

    // Amount range
    if (filters.minTargetAmount || filters.maxTargetAmount) {
      query.targetAmount = {};
      if (filters.minTargetAmount) query.targetAmount.$gte = filters.minTargetAmount;
      if (filters.maxTargetAmount) query.targetAmount.$lte = filters.maxTargetAmount;
    }

    // Date range
    if (filters.startDateFrom || filters.startDateTo) {
      query.startDate = {};
      if (filters.startDateFrom) query.startDate.$gte = new Date(filters.startDateFrom);
      if (filters.startDateTo) query.startDate.$lte = new Date(filters.startDateTo);
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query với pagination - chỉ select những field cần thiết
    const skip = (page - 1) * limit;
    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(query)
        .select('_id title description coverImage status category currentAmount donorCount milestones startDate endDate viewCount isFeatured createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.campaignModel.countDocuments(query)
    ]);

    return {
      items: campaigns,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async findOne(id: string): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BusinessException(
        CampaignErrorCode.NOT_FOUND,
        `Invalid campaign ID format: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const campaign = await this.campaignModel
      .findById(id)
      .populate('creatorId', 'name email reputation avatar')
      .exec();

    if (!campaign) {
      throw new BusinessException(
        CampaignErrorCode.NOT_FOUND,
        `Campaign with ID ${id} not found in database`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Tăng view count
    await this.campaignModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, userId: string): Promise<Campaign> {
    const campaign = await this.findOne(id);

    // Kiểm tra quyền: chỉ creator hoặc admin mới được update
    if (campaign.creatorId.toString() !== userId) {
      const user = await this.userModel.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new BusinessException(
          CampaignErrorCode.NOT_OWNER,
          `User ${userId} is not the owner of campaign ${id}`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Không được update nếu campaign đã active hoặc completed
    if ([CampaignStatus.ACTIVE, CampaignStatus.COMPLETED].includes(campaign.status)) {
      throw new BusinessException(
        CampaignErrorCode.CANNOT_EDIT,
        `Cannot edit campaign with status: ${campaign.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update campaign
    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(id, updateCampaignDto, { new: true })
      .populate('creatorId', 'name email reputation')
      .exec();

    return updatedCampaign;
  }

  async remove(id: string, userId: string): Promise<void> {
    const campaign = await this.findOne(id);

    // Kiểm tra quyền
    if (campaign.creatorId.toString() !== userId) {
      const user = await this.userModel.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new BusinessException(
          CampaignErrorCode.NOT_OWNER,
          `User ${userId} is not the owner of campaign ${id}`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Không được xóa nếu có donation
    if (campaign.currentAmount > 0) {
      throw new BusinessException(
        CampaignErrorCode.HAS_DONATIONS,
        `Cannot delete campaign ${id} with existing donations (amount: ${campaign.currentAmount})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.campaignModel.findByIdAndDelete(id);

    // Giảm thống kê creator
    await this.userModel.findByIdAndUpdate(campaign.creatorId, {
      $inc: { totalCampaignsCreated: -1 }
    });
  }

  // Business logic validation
  private async validateCampaignCreation(dto: CreateCampaignDto, creator: User): Promise<void> {
    // Validate emergency campaign reputation requirement
    if (dto.type === CampaignType.EMERGENCY) {
      if (creator.reputation < 60) {
        throw new BusinessException(
          CampaignErrorCode.EMERGENCY_REPUTATION_TOO_LOW,
          `Emergency campaign requires minimum 60 reputation. Current reputation: ${creator.reputation}`,
          HttpStatus.FORBIDDEN,
        );
      }

      // Emergency campaign chỉ có 1 milestone
      if (dto.milestones && dto.milestones.length > 1) {
        throw new BusinessException(
          CampaignErrorCode.EMERGENCY_MULTIPLE_MILESTONES,
          `Emergency campaign can only have 1 milestone, received: ${dto.milestones.length}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate milestone logic
    if (dto.milestones && dto.milestones.length > 0) {
      const totalMilestoneAmount = dto.milestones.reduce((sum, milestone) => sum + milestone.budget, 0);
      if (totalMilestoneAmount !== dto.targetAmount) {
        throw new BusinessException(
          CampaignErrorCode.MILESTONE_BUDGET_MISMATCH,
          `Total milestone budget (${totalMilestoneAmount}) must equal campaign target amount (${dto.targetAmount})`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate duration days
      for (const milestone of dto.milestones) {
        if (milestone.durationDays < 1 || milestone.durationDays > 365) {
          throw new BusinessException(
            CampaignErrorCode.MILESTONE_DURATION_INVALID,
            `Milestone duration must be between 1 and 365 days, received: ${milestone.durationDays}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    // Validate date logic
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (start >= end) {
        throw new BusinessException(
          CampaignErrorCode.END_DATE_BEFORE_START,
          `Start date (${dto.startDate}) must be before end date (${dto.endDate})`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Check creator campaign limit (prevent spam)
    const activeCampaignsCount = await this.campaignModel.countDocuments({
      creatorId: creator._id,
      status: { $in: [CampaignStatus.PENDING_REVIEW, CampaignStatus.ACTIVE] }
    });

    const maxActiveCampaigns = creator.reputation >= 80 ? 5 : creator.reputation >= 60 ? 3 : 2;
    if (activeCampaignsCount >= maxActiveCampaigns) {
      throw new BusinessException(
        CampaignErrorCode.ACTIVE_LIMIT_EXCEEDED,
        `User has reached maximum of ${maxActiveCampaigns} active campaigns. Current active: ${activeCampaignsCount}. User reputation: ${creator.reputation}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  // Helper methods for campaign management
  async approveCampaign(id: string, reviewerId: string, comments?: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    
    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BusinessException(
        CampaignErrorCode.CANNOT_EDIT,
        `Can only approve campaigns with PENDING_REVIEW status. Current status: ${campaign.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const reviewer = await this.userModel.findById(reviewerId);
    if (!reviewer) {
      throw new BusinessException(
        CampaignErrorCode.REVIEWER_NOT_FOUND,
        `Reviewer with ID ${reviewerId} not found in database`,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedCampaign = await this.campaignModel.findByIdAndUpdate(
      id,
      {
        status: CampaignStatus.APPROVED,
        approvedAt: new Date(),
        review: {
          reviewerId: new Types.ObjectId(reviewerId),
          reviewerName: reviewer.name,
          status: ReviewStatus.APPROVED,
          comments,
          reviewedAt: new Date(),
          priority: this.calculateReviewPriority(campaign.reviewFee)
        }
      },
      { new: true }
    );

    return updatedCampaign;
  }

  async rejectCampaign(id: string, reviewerId: string, reason: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    
    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BusinessException(
        CampaignErrorCode.CANNOT_EDIT,
        `Can only reject campaigns with PENDING_REVIEW status. Current status: ${campaign.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const reviewer = await this.userModel.findById(reviewerId);
    if (!reviewer) {
      throw new BusinessException(
        CampaignErrorCode.REVIEWER_NOT_FOUND,
        `Reviewer with ID ${reviewerId} not found in database`,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedCampaign = await this.campaignModel.findByIdAndUpdate(
      id,
      {
        status: CampaignStatus.REJECTED,
        rejectionReason: reason,
        review: {
          reviewerId: new Types.ObjectId(reviewerId),
          reviewerName: reviewer.name,
          status: ReviewStatus.REJECTED,
          comments: reason,
          reviewedAt: new Date(),
          priority: this.calculateReviewPriority(campaign.reviewFee)
        }
      },
      { new: true }
    );

    return updatedCampaign;
  }

  private calculateReviewPriority(reviewFee: number): number {
    // Calculate priority score based on review fee
    if (reviewFee >= 500000) return 4; // URGENT
    if (reviewFee >= 200000) return 3; // HIGH
    if (reviewFee >= 50000) return 2; // MEDIUM
    return 1; // LOW
  }

  // Get campaigns needing review, sorted by priority (review fee)
  async getCampaignsForReview(limit: number = 20) {
    return this.campaignModel
      .find({ status: CampaignStatus.PENDING_REVIEW })
      .sort({ reviewFee: -1, createdAt: 1 }) // Higher fee first, then older first
      .limit(limit)
      .populate('creatorId', 'name email reputation')
      .exec();
  }

  // ========================================
  // CAMPAIGN FOLLOW/UNFOLLOW METHODS
  // ========================================

  async followCampaign(campaignId: string, userId: string, followDto?: FollowCampaignDto): Promise<CampaignFollow> {
    // Validate campaign exists
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new BusinessException(
        CampaignErrorCode.NOT_FOUND,
        `Campaign with ID ${campaignId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BusinessException(
        CampaignErrorCode.CREATOR_NOT_FOUND,
        `User with ID ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if user is already following
    const existingFollow = await this.campaignFollowModel.findOne({
      campaignId: new Types.ObjectId(campaignId),
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (existingFollow) {
      throw new BusinessException(
        CommonErrorCode.BAD_REQUEST,
        'User is already following this campaign',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create follow record
    const followData = {
      campaignId: new Types.ObjectId(campaignId),
      userId: new Types.ObjectId(userId),
      userName: user.name,
      campaignTitle: campaign.title,
      isActive: true,
      followedAt: new Date()
    };

    const campaignFollow = new this.campaignFollowModel(followData);
    await campaignFollow.save();

    // Update campaign interested count
    await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $inc: { interestedCount: 1 } }
    );

    // Get updated count
    const updatedCampaign = await this.campaignModel.findById(campaignId);
    
    return campaignFollow;
  }

  async unfollowCampaign(campaignId: string, userId: string, unfollowDto?: UnfollowCampaignDto): Promise<{ message: string }> {
    // Validate campaign exists
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new BusinessException(
        CampaignErrorCode.NOT_FOUND,
        `Campaign with ID ${campaignId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BusinessException(
        CampaignErrorCode.CREATOR_NOT_FOUND,
        `User with ID ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Find existing follow
    const existingFollow = await this.campaignFollowModel.findOne({
      campaignId: new Types.ObjectId(campaignId),
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (!existingFollow) {
      throw new BusinessException(
        CommonErrorCode.BAD_REQUEST,
        'User is not following this campaign',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Soft delete follow record
    await this.campaignFollowModel.findByIdAndUpdate(
      existingFollow._id,
      { isActive: false }
    );

    // Update campaign interested count
    await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $inc: { interestedCount: -1 } }
    );

    // Get updated count
    const updatedCampaign = await this.campaignModel.findById(campaignId);
    
    return { message: 'Đã bỏ theo dõi chiến dịch thành công' };
  }

  async getCampaignFollowers(campaignId: string, queryDto: CampaignFollowersQueryDto): Promise<{
    data: CampaignFollow[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 20, sortBy = 'followedAt', sortOrder = 'desc' } = queryDto;
    
    // Validate campaign exists
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new BusinessException(
        CampaignErrorCode.NOT_FOUND,
        `Campaign with ID ${campaignId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Build query
    const query = {
      campaignId: new Types.ObjectId(campaignId),
      isActive: true
    };

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      this.campaignFollowModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.campaignFollowModel.countDocuments(query)
    ]);

    return {
      data: followers,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getUserFollowedCampaigns(userId: string, queryDto: CampaignFollowersQueryDto): Promise<{
    data: CampaignFollow[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 20, sortBy = 'followedAt', sortOrder = 'desc' } = queryDto;
    
    // Validate user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BusinessException(
        CampaignErrorCode.CREATOR_NOT_FOUND,
        `User with ID ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Build query
    const query = {
      userId: new Types.ObjectId(userId),
      isActive: true
    };

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [follows, total] = await Promise.all([
      this.campaignFollowModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.campaignFollowModel.countDocuments(query)
    ]);

    return {
      data: follows,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async checkUserFollowStatus(campaignId: string, userId: string): Promise<CampaignFollow | null> {
    const follow = await this.campaignFollowModel.findOne({
      campaignId: new Types.ObjectId(campaignId),
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    return follow;
  }
} 