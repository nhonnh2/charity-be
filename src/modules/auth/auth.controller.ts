import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, GoogleOAuthDto, FacebookOAuthDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký thành công',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email đã được sử dụng' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email hoặc mật khẩu không chính xác' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token được làm mới thành công',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token không hợp lệ hoặc đã hết hạn' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất và vô hiệu hóa refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng xuất thành công' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token không hợp lệ' 
  })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Đăng xuất thành công' };
  }

  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập/Đăng ký bằng Google OAuth' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập Google thành công',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Google ID token không hợp lệ' 
  })
  async googleOAuth(@Body() googleOAuthDto: GoogleOAuthDto): Promise<AuthResponseDto> {
    return this.authService.googleOAuth(googleOAuthDto);
  }

  @Post('oauth/facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập/Đăng ký bằng Facebook OAuth' })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập Facebook thành công',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Facebook access token không hợp lệ' 
  })
  async facebookOAuth(@Body() facebookOAuthDto: FacebookOAuthDto): Promise<AuthResponseDto> {
    return this.authService.facebookOAuth(facebookOAuthDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin profile của user hiện tại' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin profile',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token không hợp lệ' 
  })
  async getProfile(@Request() req) {
    return req.user;
  }
} 