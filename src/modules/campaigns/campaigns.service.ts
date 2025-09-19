import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './entities/campaign.entity';
import { User } from '../users/entities/user.entity';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto } from './dto';
import { CampaignType, CampaignStatus, ReviewStatus } from '../../shared/enums';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<Campaign> {
    // Tìm thông tin creator
    const creator = await this.userModel.findById(userId);
    if (!creator) {
      throw new NotFoundException('Không tìm thấy thông tin người tạo chiến dịch');
    }

    // Validate business rules
    await this.validateCampaignCreation(createCampaignDto, creator);

    // Tạo campaign data
    const campaignData = {
      ...createCampaignDto,
      creatorId: new Types.ObjectId(userId),
      creatorName: creator.name,
      status: CampaignStatus.PENDING_REVIEW,
    };

    // Xử lý milestones cho emergency campaign (chỉ 1 giai đoạn)
    if (createCampaignDto.type === CampaignType.EMERGENCY) {
      campaignData.milestones = [{
        title: 'Giải ngân toàn bộ',
        description: 'Giải ngân toàn bộ số tiền cho chiến dịch khẩn cấp',
        targetAmount: createCampaignDto.targetAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
      }] as any;
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

    // Execute query với pagination
    const skip = (page - 1) * limit;
    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name email reputation')
        .exec(),
      this.campaignModel.countDocuments(query)
    ]);

    return {
      data: campaigns,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID chiến dịch không hợp lệ');
    }

    const campaign = await this.campaignModel
      .findById(id)
      .populate('creatorId', 'name email reputation avatar')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy chiến dịch');
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
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa chiến dịch này');
      }
    }

    // Không được update nếu campaign đã active hoặc completed
    if ([CampaignStatus.ACTIVE, CampaignStatus.COMPLETED].includes(campaign.status)) {
      throw new BadRequestException('Không thể chỉnh sửa chiến dịch đã kích hoạt hoặc hoàn thành');
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
        throw new ForbiddenException('Bạn không có quyền xóa chiến dịch này');
      }
    }

    // Không được xóa nếu có donation
    if (campaign.currentAmount > 0) {
      throw new BadRequestException('Không thể xóa chiến dịch đã có quyên góp');
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
        throw new ForbiddenException(
          `Tạo chiến dịch khẩn cấp yêu cầu uy tín tối thiểu 60 điểm. Uy tín hiện tại của bạn: ${creator.reputation}`
        );
      }

      // Emergency campaign chỉ có 1 milestone
      if (dto.milestones && dto.milestones.length > 1) {
        throw new BadRequestException('Chiến dịch khẩn cấp chỉ có thể có 1 giai đoạn giải ngân');
      }
    }

    // Validate milestone logic
    if (dto.milestones && dto.milestones.length > 0) {
      const totalMilestoneAmount = dto.milestones.reduce((sum, milestone) => sum + milestone.targetAmount, 0);
      if (totalMilestoneAmount !== dto.targetAmount) {
        throw new BadRequestException('Tổng số tiền các milestone phải bằng mục tiêu của chiến dịch');
      }
    }

    // Validate date logic
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (start >= end) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }
    }

    // Check creator campaign limit (prevent spam)
    const activeCampaignsCount = await this.campaignModel.countDocuments({
      creatorId: creator._id,
      status: { $in: [CampaignStatus.PENDING_REVIEW, CampaignStatus.ACTIVE] }
    });

    const maxActiveCampaigns = creator.reputation >= 80 ? 5 : creator.reputation >= 60 ? 3 : 2;
    if (activeCampaignsCount >= maxActiveCampaigns) {
      throw new ForbiddenException(
        `Bạn đã đạt giới hạn ${maxActiveCampaigns} chiến dịch đang hoạt động. Hãy hoàn thành các chiến dịch hiện tại trước khi tạo mới.`
      );
    }
  }

  // Helper methods for campaign management
  async approveCampaign(id: string, reviewerId: string, comments?: string): Promise<Campaign> {
    const campaign = await this.findOne(id);
    
    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException('Chỉ có thể duyệt chiến dịch đang chờ duyệt');
    }

    const reviewer = await this.userModel.findById(reviewerId);
    if (!reviewer) {
      throw new NotFoundException('Không tìm thấy thông tin người duyệt');
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
      throw new BadRequestException('Chỉ có thể từ chối chiến dịch đang chờ duyệt');
    }

    const reviewer = await this.userModel.findById(reviewerId);
    if (!reviewer) {
      throw new NotFoundException('Không tìm thấy thông tin người duyệt');
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
} 