import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessException } from '@/core/exceptions/business.exception';
import { PostErrorCode } from '@/shared/enums/error-codes.enum';
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';
import { PostView, PostViewDocument } from '../entities/post-view.entity';
import { Post, PostDocument } from '../entities/post.entity';

@Injectable()
export class PostViewsService {
  constructor(
    @InjectModel(PostView.name) private postViewModel: Model<PostViewDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  /**
   * Track a view for a post
   */
  async trackView(
    postId: string, 
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    referrer?: string,
    source: string = 'web'
  ): Promise<PostView> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userId && !Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid user ID format: ${userId}`,
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

      // Check if already viewed by this user/session (prevent duplicate views)
      const existingView = await this.postViewModel.findOne({
        postId: new Types.ObjectId(postId),
        $or: [
          ...(userId ? [{ userId: new Types.ObjectId(userId) }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      }).session(session);

      if (existingView) {
        // Update existing view timestamp
        existingView.viewedAt = new Date();
        existingView.duration = existingView.duration || 0;
        return await existingView.save({ session });
      }

      // Create new view
      const view = new this.postViewModel({
        postId: new Types.ObjectId(postId),
        userId: userId ? new Types.ObjectId(userId) : undefined,
        sessionId,
        ipAddress,
        userAgent,
        referrer,
        source,
      });

      const savedView = await view.save({ session });

      // Update post views count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.viewsCount': 1 } },
        { session }
      );

      return savedView;
    });
  }

  /**
   * Get views count for a post
   */
  async getViewsCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postViewModel.countDocuments({
      postId: new Types.ObjectId(postId),
    });
  }

  /**
   * Get unique views count for a post (distinct users)
   */
  async getUniqueViewsCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.postViewModel.aggregate([
      { $match: { postId: new Types.ObjectId(postId) } },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueViews' }
    ]);

    return result[0]?.uniqueViews || 0;
  }

  /**
   * Get views for a post with pagination
   */
  async getPostViews(
    postId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    items: PostView[];
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
    const [views, total] = await Promise.all([
      this.postViewModel
        .find({ postId: new Types.ObjectId(postId) })
        .populate('userId', 'name email avatar')
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postViewModel.countDocuments({ postId: new Types.ObjectId(postId) })
    ]);

    return {
      items: views,
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
   * Get user's viewed posts
   */
  async getUserViewedPosts(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    items: PostView[];
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
    const [views, total] = await Promise.all([
      this.postViewModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('postId', 'content creator engagement createdAt')
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postViewModel.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return {
      items: views,
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
   * Get view analytics for a post
   */
  async getViewAnalytics(postId: string): Promise<{
    totalViews: number;
    uniqueViews: number;
    viewsBySource: { [key: string]: number };
    viewsByLocation: { [key: string]: number };
    viewsOverTime: { date: string; views: number }[];
    recentViews: PostView[];
  }> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [totalViews, uniqueViews, viewsBySource, viewsByLocation, viewsOverTime, recentViews] = await Promise.all([
      this.postViewModel.countDocuments({ postId: new Types.ObjectId(postId) }),
      this.getUniqueViewsCount(postId),
      this.postViewModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      this.postViewModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        { $group: { _id: '$location.country', count: { $sum: 1 } } }
      ]),
      this.postViewModel.aggregate([
        { $match: { postId: new Types.ObjectId(postId) } },
        {
          $group: {
            _id: {
              year: { $year: '$viewedAt' },
              month: { $month: '$viewedAt' },
              day: { $dayOfMonth: '$viewedAt' }
            },
            views: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 30 }
      ]),
      this.postViewModel
        .find({ postId: new Types.ObjectId(postId) })
        .populate('userId', 'name email avatar')
        .sort({ viewedAt: -1 })
        .limit(10)
        .exec()
    ]);

    return {
      totalViews,
      uniqueViews,
      viewsBySource: viewsBySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      viewsByLocation: viewsByLocation.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      viewsOverTime: viewsOverTime.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        views: item.views
      })),
      recentViews,
    };
  }

  /**
   * Get trending posts based on views
   */
  async getTrendingPostsByViews(
    timeRange: 'day' | 'week' | 'month' = 'week',
    limit: number = 20
  ): Promise<PostView[]> {
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

    return await this.postViewModel
      .find({ viewedAt: { $gte: startDate } })
      .populate('postId', 'content creator engagement createdAt')
      .populate('userId', 'name email avatar')
      .sort({ viewedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Update view duration (for tracking how long user viewed)
   */
  async updateViewDuration(
    postId: string, 
    userId: string, 
    duration: number
  ): Promise<PostView> {
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        'Invalid post or user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const view = await this.postViewModel.findOneAndUpdate(
      {
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      },
      { duration },
      { new: true }
    );

    if (!view) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        'View record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return view;
  }
}

