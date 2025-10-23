import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { TransformResponseDTO } from '@/shared/decorators/transform-response.dto';
import { PostsService } from './posts.service';
import { 
  CreatePostDto, 
  UpdatePostDto, 
  QueryPostsDto,
  CreateInteractionDto,
  CreateCommentDto,
  CreateShareDto
} from './dto';
import { 
  PostResponseDto, 
  PostListResponseDto 
} from './dto/response';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài viết thành công' })
  @TransformResponseDTO(PostResponseDto)
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài viết' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách bài viết thành công' })
  @TransformResponseDTO(PostResponseDto)
  async findAll(@Query() queryDto: QueryPostsDto) {
    return this.postsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết bài viết thành công' })
  @TransformResponseDTO(PostResponseDto)
  async findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    // userId có thể truyền qua query parameter để check quyền xem private posts
    return this.postsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiResponse({ status: 200, description: 'Cập nhật bài viết thành công' })
  @TransformResponseDTO(PostResponseDto)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    return this.postsService.update(id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiResponse({ status: 200, description: 'Xóa bài viết thành công' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.postsService.remove(id, req.user.id);
    return { message: 'Xóa bài viết thành công' };
  }

  // ========================================
  // INTERACTION ENDPOINTS
  // ========================================

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thích bài viết' })
  @ApiResponse({ status: 200, description: 'Thích bài viết thành công' })
  async likePost(@Param('id') id: string, @Request() req) {
    await this.postsService.likePost(id, req.user.id);
    return { message: 'Thích bài viết thành công' };
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bỏ thích bài viết' })
  @ApiResponse({ status: 200, description: 'Bỏ thích bài viết thành công' })
  async unlikePost(@Param('id') id: string, @Request() req) {
    await this.postsService.unlikePost(id, req.user.id);
    return { message: 'Bỏ thích bài viết thành công' };
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bình luận bài viết' })
  @ApiResponse({ status: 201, description: 'Thêm bình luận thành công' })
  async commentPost(
    @Param('id') id: string, 
    @Body() commentData: CreateCommentDto, 
    @Request() req
  ) {
    const comment = await this.postsService.commentPost(id, req.user.id, commentData);
    return { 
      message: 'Thêm bình luận thành công',
      comment: {
        id: comment._id,
        content: comment.commentData?.content,
        createdAt: comment.createdAt,
      }
    };
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chia sẻ bài viết' })
  @ApiResponse({ status: 201, description: 'Chia sẻ bài viết thành công' })
  async sharePost(
    @Param('id') id: string, 
    @Body() shareData: CreateShareDto, 
    @Request() req
  ) {
    await this.postsService.sharePost(id, req.user.id, shareData);
    return { message: 'Chia sẻ bài viết thành công' };
  }

  // ========================================
  // FEED ENDPOINTS
  // ========================================

  @Get('feed/timeline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy timeline cá nhân' })
  @ApiResponse({ status: 200, description: 'Lấy timeline thành công' })
  @TransformResponseDTO(PostListResponseDto)
  async getTimeline(@Query() queryDto: QueryPostsDto) {
    // TODO: Implement timeline algorithm (following users, campaign posts, etc.)
    return this.postsService.findAll(queryDto);
  }

  @Get('feed/trending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy bài viết trending' })
  @ApiResponse({ status: 200, description: 'Lấy bài viết trending thành công' })
  @TransformResponseDTO(PostListResponseDto)
  async getTrending(@Query() queryDto: QueryPostsDto, @Request() req) {
    // Sort by engagement score for trending
    const trendingQuery = { ...queryDto, sortBy: 'likesCount', sortOrder: 'desc' as const };
    return this.postsService.findAll(trendingQuery);
  }

  @Get('feed/campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy bài viết liên quan đến chiến dịch' })
  @ApiResponse({ status: 200, description: 'Lấy bài viết chiến dịch thành công' })
  @TransformResponseDTO(PostListResponseDto)
  async getCampaignPosts(@Query() queryDto: QueryPostsDto, @Request() req) {
    // Filter only posts with campaignId
    const campaignQuery = { ...queryDto, campaignId: queryDto.campaignId };
    return this.postsService.findAll(campaignQuery);
  }
}
