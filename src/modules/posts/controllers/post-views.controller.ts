import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { TransformResponseDTO } from '@/shared/decorators/transform-response.dto';
import { PostViewsService } from '../services/post-views.service';

class TrackViewDto {
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  source?: string;
}

class UpdateViewDurationDto {
  duration: number;
}

@ApiTags('Post Views')
@Controller('posts/:postId/views')
export class PostViewsController {
  constructor(private readonly postViewsService: PostViewsService) {}

  @Post()
  @ApiOperation({ summary: 'Track a view for a post' })
  @ApiResponse({ status: 201, description: 'View tracked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({ type: TrackViewDto })
  async trackView(
    @Param('postId') postId: string,
    @Body() trackViewDto: TrackViewDto,
    @Request() req
  ) {
    const view = await this.postViewsService.trackView(
      postId,
      req.user?.id,
      trackViewDto.sessionId,
      trackViewDto.ipAddress,
      trackViewDto.userAgent,
      trackViewDto.referrer,
      trackViewDto.source || 'web'
    );
    return {
      message: 'View tracked successfully',
      view: {
        id: view._id,
        postId: view.postId,
        userId: view.userId,
        sessionId: view.sessionId,
        viewedAt: view.viewedAt,
      }
    };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get views count for a post' })
  @ApiResponse({ status: 200, description: 'Views count retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getViewsCount(@Param('postId') postId: string) {
    const count = await this.postViewsService.getViewsCount(postId);
    return { count };
  }

  @Get('unique-count')
  @ApiOperation({ summary: 'Get unique views count for a post' })
  @ApiResponse({ status: 200, description: 'Unique views count retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getUniqueViewsCount(@Param('postId') postId: string) {
    const count = await this.postViewsService.getUniqueViewsCount(postId);
    return { count };
  }

  @Get()
  @ApiOperation({ summary: 'Get views for a post' })
  @ApiResponse({ status: 200, description: 'Views retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getPostViews(
    @Param('postId') postId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postViewsService.getPostViews(postId, page, limit);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get view analytics for a post' })
  @ApiResponse({ status: 200, description: 'View analytics retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getViewAnalytics(@Param('postId') postId: string) {
    return await this.postViewsService.getViewAnalytics(postId);
  }
}

@ApiTags('User Views')
@Controller('users/:userId/views')
export class UserViewsController {
  constructor(private readonly postViewsService: PostViewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s viewed posts' })
  @ApiResponse({ status: 200, description: 'Viewed posts retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUserViewedPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postViewsService.getUserViewedPosts(userId, page, limit);
  }

  @Put('duration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update view duration' })
  @ApiResponse({ status: 200, description: 'View duration updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'View not found' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: UpdateViewDurationDto })
  async updateViewDuration(
    @Param('userId') userId: string,
    @Body() updateViewDurationDto: UpdateViewDurationDto,
    @Request() req
  ) {
    // This would need postId in the request body or as a parameter
    // For now, we'll assume it's passed in the request body
    const { postId } = req.body;
    const view = await this.postViewsService.updateViewDuration(
      postId,
      userId,
      updateViewDurationDto.duration
    );
    return {
      message: 'View duration updated successfully',
      view: {
        id: view._id,
        duration: view.duration,
        viewedAt: view.viewedAt,
      }
    };
  }
}

@ApiTags('Trending Views')
@Controller('trending/views')
export class TrendingViewsController {
  constructor(private readonly postViewsService: PostViewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get trending posts based on views' })
  @ApiResponse({ status: 200, description: 'Trending posts retrieved successfully' })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['day', 'week', 'month'], description: 'Time range for trending' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of posts to return' })
  async getTrendingPostsByViews(
    @Query('timeRange') timeRange: 'day' | 'week' | 'month' = 'week',
    @Query('limit') limit: number = 20
  ) {
    return await this.postViewsService.getTrendingPostsByViews(timeRange, limit);
  }
}

