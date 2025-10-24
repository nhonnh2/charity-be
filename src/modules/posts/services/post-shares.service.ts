import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessException } from '@/core/exceptions/business.exception';
import { PostErrorCode } from '@/shared/enums/error-codes.enum';
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';
import { PostShare, PostShareDocument, ShareType } from '../entities/post-share.entity';
import { Post, PostDocument } from '../entities/post.entity';

@Injectable()
export class PostSharesService {
  constructor(
    @InjectModel(PostShare.name) private postShareModel: Model<PostShareDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  /**
   * Share a post
   */
  async sharePost(
    postId: string, 
    userId: string, 
    shareType: ShareType = ShareType.REPOST,
    shareText?: string,
    visibility: string = 'public',
    source: string = 'web'
  ): Promise<PostShare> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid user ID format: ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate share text for quote shares
    if (shareType === ShareType.QUOTE && (!shareText || shareText.trim().length === 0)) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Share text is required for quote shares',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (shareText && shareText.length > 1000) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Share text is too long (max 1000 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.databaseTransactionService.withTransaction(async (session) => {
      // Check if post exists
      const post = await this.postModel.findById(postId).session(session);
      if (!post || post.isDeleted) {
        throw new BusinessException(
          PostErrorCode.NOT_FOUND,
          `Post with ID ${postId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if already shared by this user
      const existingShare = await this.postShareModel.findOne({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      }).session(session);

      if (existingShare) {
        throw new BusinessException(
          PostErrorCode.ALREADY_SHARED,
          'You have already shared this post',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create share
      const share = new this.postShareModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        shareType,
        shareText: shareText?.trim(),
        originalPostId: new Types.ObjectId(postId),
        visibility,
        source,
      });

      const savedShare = await share.save({ session });

      // Update post shares count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.sharesCount': 1 } },
        { session }
      );

      return savedShare;
    });
  }

  /**
   * Unshare a post
   */
  async unsharePost(postId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid user ID format: ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.databaseTransactionService.withTransaction(async (session) => {
      // Find and delete share
      const share = await this.postShareModel.findOneAndDelete({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      }).session(session);

      if (!share) {
        throw new BusinessException(
          PostErrorCode.NOT_SHARED,
          'You have not shared this post',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update post shares count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.sharesCount': -1 } },
        { session }
      );
    });
  }

  /**
   * Get shares count for a post
   */
  async getSharesCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postShareModel.countDocuments({
      postId: new Types.ObjectId(postId),
    });
  }

  /**
   * Get shares for a post with pagination
   */
  async getPostShares(
    postId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    items: PostShare[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const skip = (page - 1) * limit;
    const [shares, total] = await Promise.all([
      this.postShareModel
        .find({ postId: new Types.ObjectId(postId) })
        .populate('userId', 'name email avatar reputation')
        .sort({ sharedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postShareModel.countDocuments({ postId: new Types.ObjectId(postId) })
    ]);

    return {
      items: shares,
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

  /**
   * Get user's shared posts
   */
  async getUserSharedPosts(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    items: PostShare[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid user ID format: ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const skip = (page - 1) * limit;
    const [shares, total] = await Promise.all([
      this.postShareModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('postId', 'content creator engagement createdAt')
        .populate('originalPostId', 'content creator engagement createdAt')
        .sort({ sharedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postShareModel.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return {
      items: shares,
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

  /**
   * Check if user has shared a post
   */
  async hasUserSharedPost(postId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
      return false;
    }

    const share = await this.postShareModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    return !!share;
  }

  /**
   * Get users who shared a post
   */
  async getPostSharers(postId: string, limit: number = 10): Promise<PostShare[]> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postShareModel
      .find({ postId: new Types.ObjectId(postId) })
      .populate('userId', 'name email avatar')
      .sort({ sharedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get trending posts based on shares
   */
  async getTrendingPosts(
    timeRange: 'day' | 'week' | 'month' = 'week',
    limit: number = 20
  ): Promise<PostShare[]> {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return await this.postShareModel
      .find({ sharedAt: { $gte: startDate } })
      .populate('postId', 'content creator engagement createdAt')
      .populate('userId', 'name email avatar')
      .sort({ sharedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get share analytics for a post
   */
  async getShareAnalytics(postId: string): Promise<{
    totalShares: number;
    sharesByType: { repost: number; quote: number };
    sharesBySource: { [key: string]: number };
    sharesByVisibility: { [key: string]: number };
    recentShares: PostShare[];
  }> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [totalShares, sharesByType, sharesBySource, sharesByVisibility, recentShares] = await Promise.all([
      this.postShareModel.countDocuments({ postId: new Types.ObjectId(postId) }),
      this.postShareModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        { $group: { _id: '$shareType', count: { $sum: 1 } } }
      ]),
      this.postShareModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      this.postShareModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        { $group: { _id: '$visibility', count: { $sum: 1 } } }
      ]),
      this.postShareModel
        .find({ postId: new Types.ObjectId(postId) })
        .populate('userId', 'name email avatar')
        .sort({ sharedAt: -1 })
        .limit(10)
        .exec()
    ]);

    return {
      totalShares,
      sharesByType: {
        repost: sharesByType.find(s => s._id === ShareType.REPOST)?.count || 0,
        quote: sharesByType.find(s => s._id === ShareType.QUOTE)?.count || 0,
      },
      sharesBySource: sharesBySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      sharesByVisibility: sharesByVisibility.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentShares,
    };
  }
}

