import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { TransformResponseDTO } from '@/shared/decorators/transform-response.dto';
import { PostLikesService } from '../services/post-likes.service';

@ApiTags('Post Likes')
@Controller('posts/:postId/likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 409, description: 'Already liked' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async likePost(
    @Param('postId') postId: string,
    @Request() req
  ) {
    const like = await this.postLikesService.likePost(
      postId, 
      req.user.id
    );
    return {
      message: 'Post liked successfully',
      like: {
        id: like._id,
        postId: like.postId,
        userId: like.userId,
        likedAt: like.likedAt,
      }
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 404, description: 'Not liked' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async unlikePost(@Param('postId') postId: string, @Request() req) {
    await this.postLikesService.unlikePost(postId, req.user.id);
    return { message: 'Post unliked successfully' };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get likes count for a post' })
  @ApiResponse({ status: 200, description: 'Likes count retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getLikesCount(@Param('postId') postId: string) {
    const count = await this.postLikesService.getLikesCount(postId);
    return { count };
  }

  @Get()
  @ApiOperation({ summary: 'Get likes for a post' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postLikesService.getPostLikes(postId, page, limit);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has liked a post' })
  @ApiResponse({ status: 200, description: 'Like status retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async checkUserLike(@Param('postId') postId: string, @Request() req) {
    const hasLiked = await this.postLikesService.hasUserLikedPost(postId, req.user.id);
    return { hasLiked };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users who liked a post' })
  @ApiResponse({ status: 200, description: 'Likers retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of users to return' })
  async getPostLikers(
    @Param('postId') postId: string,
    @Query('limit') limit: number = 10
  ) {
    const likers = await this.postLikesService.getPostLikers(postId, limit);
    return { likers };
  }
}

@ApiTags('User Likes')
@Controller('users/:userId/likes')
export class UserLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s liked posts' })
  @ApiResponse({ status: 200, description: 'Liked posts retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUserLikedPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postLikesService.getUserLikedPosts(userId, page, limit);
  }
}

