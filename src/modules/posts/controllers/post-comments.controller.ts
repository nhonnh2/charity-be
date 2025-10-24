import {
  Controller,
  Get,
  Post,
  Put,
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
import { PostCommentsService } from '../services/post-comments.service';

class CreateCommentDto {
  content: string;
  parentCommentId?: string;
  mentions?: string[];
}

class UpdateCommentDto {
  content: string;
}

@ApiTags('Post Comments')
@Controller('posts/:postId/comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({ type: CreateCommentDto })
  async addComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
  ) {
    const comment = await this.postCommentsService.addComment(
      postId,
      req.user.id,
      createCommentDto.content,
      createCommentDto.parentCommentId,
      createCommentDto.mentions
    );
    return {
      message: 'Comment added successfully',
      comment: {
        id: comment._id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId,
        mentions: comment.mentions,
        createdAt: comment.createdAt,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'includeReplies', required: false, type: Boolean, description: 'Include replies' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('includeReplies') includeReplies: boolean = true
  ) {
    return await this.postCommentsService.getPostComments(
      postId, 
      page, 
      limit, 
      includeReplies
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Get comments count for a post' })
  @ApiResponse({ status: 200, description: 'Comments count retrieved successfully' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  async getCommentsCount(@Param('postId') postId: string) {
    const count = await this.postCommentsService.getCommentsCount(postId);
    return { count };
  }
}

@ApiTags('Comment Management')
@Controller('comments/:commentId')
export class CommentManagementController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiBody({ type: UpdateCommentDto })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    const comment = await this.postCommentsService.updateComment(
      commentId,
      req.user.id,
      updateCommentDto.content
    );
    return {
      message: 'Comment updated successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt,
        updatedAt: comment.updatedAt,
      }
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    await this.postCommentsService.deleteComment(commentId, req.user.id);
    return { message: 'Comment deleted successfully' };
  }

  @Get('replies')
  @ApiOperation({ summary: 'Get replies for a comment' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getCommentReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return await this.postCommentsService.getCommentReplies(commentId, page, limit);
  }
}

@ApiTags('User Comments')
@Controller('users/:userId/comments')
export class UserCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s comments' })
  @ApiResponse({ status: 200, description: 'User comments retrieved successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUserComments(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return await this.postCommentsService.getUserComments(userId, page, limit);
  }
}

