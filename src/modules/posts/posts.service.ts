import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { BusinessException } from '@/core/exceptions/business.exception';
import { PostErrorCode } from '@/shared/enums/error-codes.enum';
import { DatabaseService } from '@/shared/services/database.service';
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';
import { Post, PostDocument } from './entities/post.entity';
import { PostInteraction, PostInteractionDocument } from './entities/post-interaction.entity';
import { User } from '../users/entities/user.entity';
import { 
  CreatePostDto, 
  UpdatePostDto, 
  QueryPostsDto,
  CreateInteractionDto 
} from './dto';
import { PostType, PostVisibility } from './entities/post.entity';
import { InteractionType } from './entities/post-interaction.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostInteraction.name) private interactionModel: Model<PostInteractionDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private databaseService: DatabaseService,
    private databaseTransactionService: DatabaseTransactionService,
  ) {}

  // ========================================
  // POST CRUD OPERATIONS
  // ========================================

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    // Validate user ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid user ID format: ${userId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tìm thông tin creator
    const creator = await this.userModel.findById(userId);
    if (!creator) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Creator with ID ${userId} not found in database`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate content is not empty
    const { content } = createPostDto;
    if (!content?.text && (!content?.images?.length && !content?.videos?.length && !content?.links?.length)) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Post must contain text, images, videos, or links',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Determine post type
    const postType = this.determinePostType(createPostDto);

    // Validate campaign if provided
    if (createPostDto.campaignId) {
      if (!Types.ObjectId.isValid(createPostDto.campaignId)) {
        throw new BusinessException(
          PostErrorCode.CAMPAIGN_NOT_FOUND,
          `Invalid campaign ID format: ${createPostDto.campaignId}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      // TODO: Validate campaign exists and is active
    }

    // Transform CreatePostDto to Post entity structure
    const postData = {
      content: createPostDto.content,
      creatorId: new Types.ObjectId(userId),
      creator: {
        name: creator.name,
        email: creator.email,
        avatar: creator.avatar,
        reputation: creator.reputation || 0
      },
      campaignId: createPostDto.campaignId ? new Types.ObjectId(createPostDto.campaignId) : undefined,
      type: postType,
      visibility: createPostDto.visibility || PostVisibility.PUBLIC,
      hashtags: createPostDto.hashtags || [],
      mentions: createPostDto.mentions?.map(id => new Types.ObjectId(id)) || [],
      location: createPostDto.location,
      engagement: {
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: 0,
      },
    };

    // Create post
    const post = new this.postModel(postData);

    const savedPost = await post.save();
    return savedPost;
  }

  async findAll(queryDto: QueryPostsDto,): Promise<{
    items: Post[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 10, search,userId, creatorId, campaignId, type, visibility, hashtags, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = queryDto;

    // Build query
    const query: any = { isDeleted: false };

    // Add search filter
    if (search) {
      query.$or = [
        { 'content.text': { $regex: search, $options: 'i' } },
        { hashtags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Add filters
    if (creatorId) {
      if (!Types.ObjectId.isValid(creatorId)) {
        throw new BusinessException(
          PostErrorCode.NOT_FOUND,
          `Invalid creator ID format: ${creatorId}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      query.creatorId = new Types.ObjectId(creatorId);
    }

    if (campaignId) {
      if (!Types.ObjectId.isValid(campaignId)) {
        throw new BusinessException(
          PostErrorCode.CAMPAIGN_NOT_FOUND,
          `Invalid campaign ID format: ${campaignId}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      query.campaignId = new Types.ObjectId(campaignId);
    }

    if (type) {
      query.type = type;
    }

    if (visibility) {
      query.visibility = visibility;
    }

    if (hashtags?.length) {
      query.hashtags = { $in: hashtags };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query với pagination
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('campaignId', 'title thumbnail status')
        .exec(),
      this.postModel.countDocuments(query)
    ]);
    console.log("posts________",posts)
    return {
      items: posts,
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

  async findOne(id: string, userId?: string): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.postModel
      .findById(id)
      .populate('campaignId', 'title thumbnail status')
      .exec();

    if (!post || post.isDeleted) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check visibility
    if (post.visibility === PostVisibility.PRIVATE && post.creatorId.toString() !== userId) {
      throw new BusinessException(
        PostErrorCode.PRIVATE_POST,
        'This post is private',
        HttpStatus.FORBIDDEN,
      );
    }

    // Increment view count
    await this.incrementViewCount(id);

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.postModel.findById(id);
    if (!post || post.isDeleted) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check ownership
    if (post.creatorId.toString() !== userId) {
      throw new BusinessException(
        PostErrorCode.NOT_OWNER,
        'You can only edit your own posts',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update post
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('campaignId', 'title thumbnail status')
      .exec();

    return updatedPost;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Invalid post ID format: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.postModel.findById(id);
    if (!post || post.isDeleted) {
      throw new BusinessException(
        PostErrorCode.NOT_FOUND,
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Check ownership
    if (post.creatorId.toString() !== userId) {
      throw new BusinessException(
        PostErrorCode.NOT_OWNER,
        'You can only delete your own posts',
        HttpStatus.FORBIDDEN,
      );
    }

    // Soft delete post
    await this.postModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  // ========================================
  // INTERACTION OPERATIONS
  // ========================================

  async likePost(postId: string, userId: string): Promise<void> {
    await this.databaseTransactionService.withTransaction(async (session) => {
      await this.toggleInteraction(postId, userId, InteractionType.LIKE, session);
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await this.databaseTransactionService.withTransaction(async (session) => {
      await this.removeInteraction(postId, userId, InteractionType.LIKE, session);
    });
  }

  async commentPost(postId: string, userId: string, commentData: CreateInteractionDto['commentData']): Promise<PostInteraction> {
    if (!commentData?.content) {
      throw new BusinessException(
        PostErrorCode.CONTENT_REQUIRED,
        'Comment content is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.databaseTransactionService.withTransaction(async (session) => {
      // Validate post exists
      const post = await this.postModel.findById(postId).session(session);
      if (!post || post.isDeleted) {
        throw new BusinessException(
          PostErrorCode.NOT_FOUND,
          `Post with ID ${postId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Create comment
      const comment = new this.interactionModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        type: InteractionType.COMMENT,
        commentData: {
          content: commentData.content,
          parentCommentId: commentData.parentCommentId ? new Types.ObjectId(commentData.parentCommentId) : undefined,
          mentions: commentData.mentions?.map(id => new Types.ObjectId(id)),
        },
      });

      const result = await comment.save({ session });

      // Update post comments count
      await this.postModel.findByIdAndUpdate(
        postId, 
        { $inc: { 'engagement.commentsCount': 1 } },
        { session }
      );

      return result;
    });
  }

  async sharePost(postId: string, userId: string, shareData: CreateInteractionDto['shareData']): Promise<void> {
    await this.databaseTransactionService.withTransaction(async (session) => {
      // Validate post exists
      const post = await this.postModel.findById(postId).session(session);
      if (!post || post.isDeleted) {
        throw new BusinessException(
          PostErrorCode.NOT_FOUND,
          `Post with ID ${postId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if already shared
      const existingShare = await this.interactionModel.findOne({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        type: InteractionType.SHARE,
      }).session(session);

      if (existingShare) {
        throw new BusinessException(
          PostErrorCode.ALREADY_SHARED,
          'You have already shared this post',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create share
      const share = new this.interactionModel({
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        type: InteractionType.SHARE,
        shareData: {
          shareText: shareData?.shareText,
          shareType: shareData?.shareType || 'repost',
          originalPostId: new Types.ObjectId(postId),
        },
      });

      await share.save({ session });

      // Update post shares count
      await this.postModel.findByIdAndUpdate(
        postId, 
        { $inc: { 'engagement.sharesCount': 1 } },
        { session }
      );
    });
  }

  // ========================================
  // HELPER METHODS
  // ========================================


  private determinePostType(createPostDto: CreatePostDto): PostType {
    const { content } = createPostDto;
    
    const hasText = !!content?.text;
    const hasImages = !!content?.images?.length;
    const hasVideos = !!content?.videos?.length;
    const hasLinks = !!content?.links?.length;

    if (hasImages && hasVideos) return PostType.MIXED;
    if (hasImages) return PostType.IMAGE;
    if (hasVideos) return PostType.VIDEO;
    if (hasLinks) return PostType.LINK;
    if (hasText) return PostType.TEXT;

    return PostType.TEXT;
  }

  private async toggleInteraction(postId: string, userId: string, type: InteractionType, session?: ClientSession): Promise<void> {
    const existingInteraction = await this.interactionModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      type,
    }).session(session);

    if (existingInteraction) {
      throw new BusinessException(
        PostErrorCode.ALREADY_LIKED,
        `You have already ${type}d this post`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create interaction
    const interaction = new this.interactionModel({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      type,
    });

    await interaction.save({ session });

    // Update post engagement count
    const field = `${type}sCount`;
    await this.postModel.findByIdAndUpdate(
      postId, 
      { $inc: { [`engagement.${field}`]: 1 } },
      { session }
    );
  }

  private async removeInteraction(postId: string, userId: string, type: InteractionType, session?: ClientSession): Promise<void> {
    const interaction = await this.interactionModel.findOneAndDelete({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      type,
    }).session(session);

    if (!interaction) {
      throw new BusinessException(
        PostErrorCode.NOT_LIKED,
        `You have not ${type}d this post`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update post engagement count
    const field = `${type}sCount`;
    await this.postModel.findByIdAndUpdate(
      postId, 
      { $inc: { [`engagement.${field}`]: -1 } },
      { session }
    );
  }

  private async incrementViewCount(postId: string): Promise<void> {
    // View count increment doesn't need transaction as it's a simple atomic operation
    // and doesn't affect data consistency if it fails occasionally
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { 'engagement.viewsCount': 1 }
    });
  }

  private async isPostLiked(postId: string, userId: string): Promise<boolean> {
    const interaction = await this.interactionModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      type: InteractionType.LIKE,
    });
    return !!interaction;
  }

  private async isPostShared(postId: string, userId: string): Promise<boolean> {
    const interaction = await this.interactionModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
      type: InteractionType.SHARE,
    });
    return !!interaction;
  }

}
