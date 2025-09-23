import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadMediaDto, UploadMediaSwaggerDto, QueryMediaDto, UpdateMediaDto, MediaResponseDto, MediaListResponseDto } from './dto';
import { MediaProvider } from './entities/media.entity';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadMediaSwaggerDto,
    description: 'Media file upload with metadata',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'File uploaded successfully',
    type: MediaResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file or file size exceeds limit' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @Request() req: any,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.mediaService.uploadFile(
      req.user.sub,
      file,
      uploadDto,
    );

    return this.mapToResponseDto(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get media list' })
  @ApiResponse({ 
    status: 200, 
    description: 'Media list retrieved successfully',
    type: MediaListResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async getMediaList(
    @Query() queryDto: QueryMediaDto,
    @Request() req: any,
  ): Promise<MediaListResponseDto> {
    const result = await this.mediaService.getMediaList(queryDto, req.user.sub);
    
    return {
      data: result.data.map(media => this.mapToResponseDto(media)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Media retrieved successfully',
    type: MediaResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Media not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async getMediaById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.getMediaById(id, req.user.sub);
    return this.mapToResponseDto(media);
  }


  @Put(':id')
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiResponse({ 
    status: 200, 
    description: 'Media updated successfully',
    type: MediaResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Media not found or access denied' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async updateMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaDto,
    @Request() req: any,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.updateMedia(id, updateDto, req.user.sub);
    return this.mapToResponseDto(media);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ 
    status: 200, 
    description: 'Media deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Media not found or access denied' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async deleteMedia(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.mediaService.deleteMedia(id, req.user.sub);
    return { message: 'Media deleted successfully' };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL' })
  @ApiResponse({ 
    status: 200, 
    description: 'Download URL generated successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Media not found or access denied' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async downloadMedia(
    @Param('id') id: string,
    @Query('expires', new ParseIntPipe({ optional: true })) expires: number = 3600,
    @Request() req: any,
  ): Promise<{ downloadUrl: string }> {
    const downloadUrl = await this.mediaService.getSignedUrl(id, req.user.sub, expires);
    await this.mediaService.incrementDownloadCount(id);
    
    return { downloadUrl };
  }


  @Get(':id/view')
  @ApiOperation({ summary: 'View media file' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirect to media file URL' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Media not found or access denied' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async viewMedia(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const media = await this.mediaService.getMediaById(id, req.user.sub);
    res.redirect(media.url);
  }


  private mapToResponseDto(media: any): MediaResponseDto {
    return {
      id: media._id.toString(),
      originalName: media.originalName,
      filename: media.filename,
      mimetype: media.mimetype,
      size: media.size,
      type: media.type,
      provider: media.provider,
      url: media.url,
      cloudPath: media.cloudPath,
      status: media.status,
      thumbnailUrl: media.thumbnailUrl,
      metadata: media.metadata,
      tags: media.tags,
      isPublic: media.isPublic,
      description: media.description,
      altText: media.altText,
      downloadCount: media.downloadCount,
      viewCount: media.viewCount,
      uploadedAt: media.uploadedAt,
      processedAt: media.processedAt,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }
}


