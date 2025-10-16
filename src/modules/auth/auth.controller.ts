import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, GoogleOAuthDto, FacebookOAuthDto, LogoutDto, LogoutResponseDto, ProfileResponseDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TransformResponseDTO } from '../../shared/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản người dùng mới với email và mật khẩu'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký thành công',
    type: AuthResponseDto
  })
  @TransformResponseDTO(AuthResponseDto)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Đăng nhập',
    description: 'Xác thực người dùng bằng email và mật khẩu'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập thành công',
    type: AuthResponseDto
  })
  @TransformResponseDTO(AuthResponseDto)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Làm mới access token',
    description: 'Tạo access token mới bằng refresh token hợp lệ'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Làm mới token thành công',
    type: AuthResponseDto
  })
  @TransformResponseDTO(AuthResponseDto)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Đăng xuất',
    description: 'Vô hiệu hóa refresh token và đăng xuất người dùng'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng xuất thành công',
    type: LogoutResponseDto
  })
  @TransformResponseDTO(LogoutResponseDto)
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Đăng nhập Google OAuth',
    description: 'Đăng nhập hoặc đăng ký tài khoản bằng Google OAuth'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập Google OAuth thành công',
    type: AuthResponseDto
  })
  @TransformResponseDTO(AuthResponseDto)
  async googleOAuth(@Body() googleOAuthDto: GoogleOAuthDto) {
    return this.authService.googleOAuth(googleOAuthDto);
  }

  @Post('oauth/facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Đăng nhập Facebook OAuth',
    description: 'Đăng nhập hoặc đăng ký tài khoản bằng Facebook OAuth'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đăng nhập Facebook OAuth thành công',
    type: AuthResponseDto
  })
  @TransformResponseDTO(AuthResponseDto)
  async facebookOAuth(@Body() facebookOAuthDto: FacebookOAuthDto) {
    return this.authService.facebookOAuth(facebookOAuthDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy thông tin profile',
    description: 'Lấy thông tin profile của người dùng hiện tại'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin profile người dùng',
    type: ProfileResponseDto
  })
  @TransformResponseDTO(ProfileResponseDto)
  async getProfile(@Request() req) {
    return req.user;
  }

} 