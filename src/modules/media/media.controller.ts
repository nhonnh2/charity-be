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
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadMediaDto, UploadMediaSwaggerDto, QueryMediaDto, UpdateMediaDto } from './dto';
import { MediaDetailResponseDto, MediaListResponseDto, DeleteMediaResponseDto, DownloadUrlResponseDto } from './dto/response';
import { MediaProvider } from './entities/media.entity';
import { TransformResponseDTO } from '../../shared/decorators';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload media file',
    description: 'Upload file media với metadata và xử lý tự động'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadMediaSwaggerDto,
    description: 'Media file upload with metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: MediaDetailResponseDto
  })
  @TransformResponseDTO(MediaDetailResponseDto)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.mediaService.uploadFile(
      req.user.sub,
      file,
      uploadDto,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get media list',
    description: 'Lấy danh sách media với phân trang và bộ lọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Media list retrieved successfully',
    type: MediaListResponseDto
  })
  @TransformResponseDTO(MediaListResponseDto)
  async getMediaList(
    @Query() queryDto: QueryMediaDto,
    @Request() req: any,
  ) {
    return this.mediaService.getMediaList(queryDto, req.user.sub);
  }


  @Get(':id')
  @ApiOperation({ 
    summary: 'Get media by ID',
    description: 'Lấy thông tin chi tiết media theo ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Media details retrieved successfully',
    type: MediaDetailResponseDto
  })
  @TransformResponseDTO(MediaDetailResponseDto)
  async getMediaById(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.mediaService.getMediaById(id, req.user.sub);
  }


  @Put(':id')
  @ApiOperation({ 
    summary: 'Update media metadata',
    description: 'Cập nhật metadata của media file'
  })
  @ApiResponse({
    status: 200,
    description: 'Media updated successfully',
    type: MediaDetailResponseDto
  })
  @TransformResponseDTO(MediaDetailResponseDto)
  async updateMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaDto,
    @Request() req: any,
  ) {
    return this.mediaService.updateMedia(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete media file',
    description: 'Xóa media file và metadata'
  })
  @ApiResponse({
    status: 200,
    description: 'Media deleted successfully',
    type: DeleteMediaResponseDto
  })
  @TransformResponseDTO(DeleteMediaResponseDto)
  async deleteMedia(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.mediaService.deleteMedia(id, req.user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ 
    summary: 'Get download URL',
    description: 'Tạo signed URL để download media file'
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    type: DownloadUrlResponseDto
  })
  @TransformResponseDTO(DownloadUrlResponseDto)
  async downloadMedia(
    @Param('id') id: string,
    @Query('expires', new ParseIntPipe({ optional: true })) expires: number = 3600,
    @Request() req: any,
  ) {
    return this.mediaService.downloadMedia(id, req.user.sub, expires);
  }


  @Get(':id/view')
  @ApiOperation({ 
    summary: 'View media file',
    description: 'Redirect đến URL của media file để xem trực tiếp'
  })
  async viewMedia(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const media = await this.mediaService.getMediaById(id, req.user.sub);
    res.redirect(media.url);
  }


}


