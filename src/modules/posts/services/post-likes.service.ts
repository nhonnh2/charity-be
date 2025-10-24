import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessException } from '@/core/exceptions/business.exception';
import { PostErrorCode } from '@/shared/enums/error-codes.enum';
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';
import { PostLike, PostLikeDocument } from '../entities/post-like.entity';
import { Post, PostDocument } from '../entities/post.entity';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<PostLike> {
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

      // Check if already liked
      const existingLike = await this.postLikeModel.findOne({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      }).session(session);

      if (existingLike) {
        throw new BusinessException(
          PostErrorCode.ALREADY_LIKED,
          'You have already liked this post',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create like
      const like = new this.postLikeModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      });

      const savedLike = await like.save({ session });

      // Update post likes count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.likesCount': 1 } },
        { session }
      );

      return savedLike;
    });
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
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
      // Find and delete like
      const like = await this.postLikeModel.findOneAndDelete({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
      }).session(session);

      if (!like) {
        throw new BusinessException(
          PostErrorCode.NOT_LIKED,
          'You have not liked this post',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update post likes count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.likesCount': -1 } },
        { session }
      );
    });
  }

  /**
   * Get likes count for a post
   */
  async getLikesCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postLikeModel.countDocuments({
      postId: new Types.ObjectId(postId),
    });
  }

  /**
   * Get likes for a post with pagination
   */
  async getPostLikes(postId: string, page: number = 1, limit: number = 20): Promise<{
    items: PostLike[];
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
    const [likes, total] = await Promise.all([
      this.postLikeModel
        .find({ postId: new Types.ObjectId(postId) })
        .populate('userId', 'name email avatar reputation')
        .sort({ likedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postLikeModel.countDocuments({ postId: new Types.ObjectId(postId) })
    ]);

    return {
      items: likes,
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
   * Get user's liked posts
   */
  async getUserLikedPosts(userId: string, page: number = 1, limit: number = 20): Promise<{
    items: PostLike[];
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
    const [likes, total] = await Promise.all([
      this.postLikeModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('postId', 'content creator engagement createdAt')
        .sort({ likedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postLikeModel.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return {
      items: likes,
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
   * Check if user has liked a post
   */
  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
      return false;
    }

    const like = await this.postLikeModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    return !!like;
  }

  /**
   * Get users who liked a post (for notifications, etc.)
   */
  async getPostLikers(postId: string, limit: number = 10): Promise<PostLike[]> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postLikeModel
      .find({ postId: new Types.ObjectId(postId) })
      .populate('userId', 'name email avatar')
      .sort({ likedAt: -1 })
      .limit(limit)
      .exec();
  }
}

