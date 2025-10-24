import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { TransformResponseDTO } from '@/shared/decorators/transform-response.dto';
import { PostSharesService } from '../services/post-shares.service';
import { ShareType } from '../entities/post-share.entity';

class CreateShareDto {
  shareType?: ShareType;
  shareText?: string;
  visibility?: string;
  source?: string;
}

@ApiTags('Post Shares')
@Controller('posts/:postId/shares')
export class PostSharesController {
  constructor(private readonly postSharesService: PostSharesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Share a post' })
  @ApiResponse({ status: 201, description: 'Post shared successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 409, description: 'Already shared' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({ type: CreateShareDto })
  async sharePost(
    @Param('postId') postId: string,
    @Body() createShareDto: CreateShareDto,
    @Request() req
  ) {
    const share = await this.postSharesService.sharePost(
      postId,
      req.user.id,
      createShareDto.shareType || ShareType.REPOST,
      createShareDto.shareText,
      createShareDto.visibility || 'public',
      createShareDto.source || 'web'
    );
    return {
      message: 'Post shared successfully',
      share: {
        id: share._id,
        postId: share.postId,
        userId: share.userId,
        shareType: share.shareType,
        shareText: share.shareText,
        visibility: share.visibility,
        sharedAt: share.sharedAt,
      }
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unshare a post' })
  @ApiResponse({ status: 200, description: 'Post unshared successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 404, description: 'Not shared' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async unsharePost(@Param('postId') postId: string, @Request() req) {
    await this.postSharesService.unsharePost(postId, req.user.id);
    return { message: 'Post unshared successfully' };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get shares count for a post' })
  @ApiResponse({ status: 200, description: 'Shares count retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getSharesCount(@Param('postId') postId: string) {
    const count = await this.postSharesService.getSharesCount(postId);
    return { count };
  }

  @Get()
  @ApiOperation({ summary: 'Get shares for a post' })
  @ApiResponse({ status: 200, description: 'Shares retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getPostShares(
    @Param('postId') postId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postSharesService.getPostShares(postId, page, limit);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has shared a post' })
  @ApiResponse({ status: 200, description: 'Share status retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async checkUserShare(@Param('postId') postId: string, @Request() req) {
    const hasShared = await this.postSharesService.hasUserSharedPost(postId, req.user.id);
    return { hasShared };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users who shared a post' })
  @ApiResponse({ status: 200, description: 'Sharers retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of users to return' })
  async getPostSharers(
    @Param('postId') postId: string,
    @Query('limit') limit: number = 10
  ) {
    const sharers = await this.postSharesService.getPostSharers(postId, limit);
    return { sharers };
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get share analytics for a post' })
  @ApiResponse({ status: 200, description: 'Share analytics retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getShareAnalytics(@Param('postId') postId: string) {
    return await this.postSharesService.getShareAnalytics(postId);
  }
}

@ApiTags('User Shares')
@Controller('users/:userId/shares')
export class UserSharesController {
  constructor(private readonly postSharesService: PostSharesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s shared posts' })
  @ApiResponse({ status: 200, description: 'Shared posts retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUserSharedPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postSharesService.getUserSharedPosts(userId, page, limit);
  }
}

@ApiTags('Trending')
@Controller('trending/shares')
export class TrendingSharesController {
  constructor(private readonly postSharesService: PostSharesService) {}

  @Get()
  @ApiOperation({ summary: 'Get trending posts based on shares' })
  @ApiResponse({ status: 200, description: 'Trending posts retrieved successfully' })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['day', 'week', 'month'], description: 'Time range for trending' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of posts to return' })
  async getTrendingPosts(
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' = 'week',
    @Query('limit') limit: number = 20
  ) {
    return await this.postSharesService.getTrendingPosts(timeRange, limit);
  }
}

