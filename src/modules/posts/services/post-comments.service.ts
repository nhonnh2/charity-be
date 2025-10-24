import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessException } from '@/core/exceptions/business.exception';
import { PostErrorCode } from '@/shared/enums/error-codes.enum';
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';
import { PostComment, PostCommentDocument } from '../entities/post-comment.entity';
import { Post, PostDocument } from '../entities/post.entity';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectModel(PostComment.name) private postCommentModel: Model<PostCommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string, 
    userId: string, 
    content: string, 
    parentCommentId?: string,
    mentions?: string[]
  ): Promise<PostComment> {
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

    if (!content || content.trim().length === 0) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Comment content is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (content.length > 2000) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Comment content is too long (max 2000 characters)',
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

      // Validate parent comment if provided
      if (parentCommentId) {
        if (!Types.ObjectId.isValid(parentCommentId)) {
          throw new BusinessException(
            PostErrorCode.NOT_FOUND,
            `Invalid parent comment ID format: ${parentCommentId}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const parentComment = await this.postCommentModel.findById(parentCommentId).session(session);
        if (!parentComment || parentComment.isDeleted || parentComment.postId.toString() !== postId) {
          throw new BusinessException(
            PostErrorCode.NOT_FOUND,
            'Parent comment not found or invalid',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Create comment
      const comment = new this.postCommentModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        content: content.trim(),
        parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : undefined,
        mentions: mentions?.map(id => new Types.ObjectId(id)) || [],
      });

      const savedComment = await comment.save({ session });

      // Update post comments count
      await this.postModel.findByIdAndUpdate(
        postId,
        { $inc: { 'engagement.commentsCount': 1 } },
        { session }
      );

      // Update parent comment replies count if it's a reply
      if (parentCommentId) {
        await this.postCommentModel.findByIdAndUpdate(
          parentCommentId,
          { $inc: { 'engagement.repliesCount': 1 } },
          { session }
        );
      }

      return savedComment;
    });
  }

  /**
   * Get comments for a post with pagination
   */
  async getPostComments(
    postId: string, 
    page: number = 1, 
    limit: number = 20,
    includeReplies: boolean = true
  ): Promise<{
    items: PostComment[];
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
    const query: any = { 
      postId: new Types.ObjectId(postId), 
      isDeleted: false 
    };

    // If not including replies, only get top-level comments
    if (!includeReplies) {
      query.parentCommentId = { $exists: false };
    }

    const [comments, total] = await Promise.all([
      this.postCommentModel
        .find(query)
        .populate('userId', 'name email avatar reputation')
        .populate('mentions', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postCommentModel.countDocuments(query)
    ]);

    return {
      items: comments,
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
   * Get replies for a specific comment
   */
  async getCommentReplies(
    commentId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    items: PostComment[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid comment ID format: ${commentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const skip = (page - 1) * limit;
    const [replies, total] = await Promise.all([
      this.postCommentModel
        .find({ 
          parentCommentId: new Types.ObjectId(commentId), 
          isDeleted: false 
        })
        .populate('userId', 'name email avatar reputation')
        .populate('mentions', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postCommentModel.countDocuments({ 
        parentCommentId: new Types.ObjectId(commentId), 
        isDeleted: false 
      })
    ]);

    return {
      items: replies,
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
   * Update a comment
   */
  async updateComment(
    commentId: string, 
    userId: string, 
    content: string
  ): Promise<PostComment> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid comment ID format: ${commentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!content || content.trim().length === 0) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Comment content is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (content.length > 2000) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Comment content is too long (max 2000 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const comment = await this.postCommentModel.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        'Comment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      throw new BusinessException(
        PostErrorCode.NOT_OWNER,
        'You can only edit your own comments',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update comment
    const updatedComment = await this.postCommentModel.findByIdAndUpdate(
      commentId,
      { 
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email avatar reputation');

    return updatedComment;
  }

  /**
   * Delete a comment (soft delete)
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid comment ID format: ${commentId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.databaseTransactionService.withTransaction(async (session) => {
      const comment = await this.postCommentModel.findById(commentId).session(session);
      if (!comment || comment.isDeleted) {
        throw new BusinessException(
          PostErrorCode.NOT_FOUND,
          'Comment not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check ownership
      if (comment.userId.toString() !== userId) {
        throw new BusinessException(
          PostErrorCode.NOT_OWNER,
          'You can only delete your own comments',
          HttpStatus.FORBIDDEN,
        );
      }

      // Soft delete comment
      await this.postCommentModel.findByIdAndUpdate(
        commentId,
        { isDeleted: true },
        { session }
      );

      // Update post comments count
      await this.postModel.findByIdAndUpdate(
        comment.postId,
        { $inc: { 'engagement.commentsCount': -1 } },
        { session }
      );

      // Update parent comment replies count if it's a reply
      if (comment.parentCommentId) {
        await this.postCommentModel.findByIdAndUpdate(
          comment.parentCommentId,
          { $inc: { 'engagement.repliesCount': -1 } },
          { session }
        );
      }
    });
  }

  /**
   * Get comments count for a post
   */
  async getCommentsCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.postCommentModel.countDocuments({
      postId: new Types.ObjectId(postId),
      isDeleted: false
    });
  }

  /**
   * Get user's comments
   */
  async getUserComments(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    items: PostComment[];
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
    const [comments, total] = await Promise.all([
      this.postCommentModel
        .find({ 
          userId: new Types.ObjectId(userId), 
          isDeleted: false 
        })
        .populate('postId', 'content creator engagement createdAt')
        .populate('parentCommentId', 'content userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postCommentModel.countDocuments({ 
        userId: new Types.ObjectId(userId), 
        isDeleted: false 
      })
    ]);

    return {
      items: comments,
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
}

