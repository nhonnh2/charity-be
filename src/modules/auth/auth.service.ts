import { Injectable, UnauthorizedException, UnprocessableEntityException,ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, GoogleOAuthDto, FacebookOAuthDto } from './dto';
import { UsersService } from '../users/users.service';
import { GoogleOAuthService } from './google-oauth.service';
import { FacebookOAuthService } from './facebook-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly facebookOAuthService: FacebookOAuthService,
  ) {}

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setMinutes(refreshTokenExpiresAt.getMinutes() + 30); // 30 minutes

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken,
      refreshTokenExpiresAt,
    });
  }

  private async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 },
    });
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Generate tokens
    const payload = { 
      sub: savedUser._id.toString(), 
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    
    // Save refresh token
    await this.saveRefreshToken(savedUser._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      csrfToken:crypto.randomBytes(64).toString('hex'),
      user: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException('Email hoặc mật khẩu không chính xác');
    }

    // Block password login for Google-linked accounts without password
    if (!user.password && user.googleProvider) {
      throw new UnprocessableEntityException('Tài khoản này đăng nhập bằng Google. Vui lòng dùng Google Sign-in.');
    }

    // Check password
    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Email hoặc mật khẩu không chính xác');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnprocessableEntityException('Tài khoản đã bị khóa');
    }
    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { 
      lastLoginAt: new Date() 
    });
    // Generate tokens
    const payload = { 
      sub: user._id.toString(), 
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    //Save refresh token
    await this.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      csrfToken:crypto.randomBytes(64).toString('hex'),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;
    console.log("refreshToken_____",refreshToken)
    // Find user by refresh token
    const user = await this.userModel.findOne({
      refreshToken,
      // refreshTokenExpiresAt: { $gt: new Date() },
    });
    console.log("refreshToken_____user",user)
    if (!user) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Generate new tokens
    const payload = { 
      sub: user._id.toString(), 
      email: user.email,
      role: user.role,
    };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken();
    
    // Save new refresh token (token rotation)
    await this.saveRefreshToken(user._id.toString(), newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      csrfToken:crypto.randomBytes(64).toString('hex'),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.clearRefreshToken(userId);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).select('-password').exec();
  }

  async googleOAuth(googleOAuthDto: GoogleOAuthDto): Promise<AuthResponseDto> {
    const { idToken, nonce } = googleOAuthDto;
    console.log("googleOAuth___",idToken,nonce)
    try {
      // Verify Google ID token
      const googleUserInfo = await this.googleOAuthService.getGoogleUserInfo(idToken, nonce);
      
      // Check if user already exists by email
      let user = await this.usersService.findByEmail(googleUserInfo.email);
      
      if (user) {
        // User exists - link Google provider if not already linked
        if (!user.googleProvider) {
          await this.userModel.findByIdAndUpdate(user._id, {
            googleProvider: {
              googleSub: googleUserInfo.googleSub,
              email: googleUserInfo.email,
              name: googleUserInfo.name,
              picture: googleUserInfo.picture,
            }
          });
        } else {
          // Update Google provider info if it exists
          await this.userModel.findByIdAndUpdate(user._id, {
            'googleProvider.googleSub': googleUserInfo.googleSub,
            'googleProvider.email': googleUserInfo.email,
            'googleProvider.name': googleUserInfo.name,
            'googleProvider.picture': googleUserInfo.picture,
          });
        }
      } else {
        // Create new user with Google provider (no password)
        user = new this.userModel({
          name: googleUserInfo.name,
          email: googleUserInfo.email,
          avatar: googleUserInfo.picture,
          isVerified: true, // Google verified email
          googleProvider: {
            googleSub: googleUserInfo.googleSub,
            email: googleUserInfo.email,
            name: googleUserInfo.name,
            picture: googleUserInfo.picture,
          }
        });
        
        user = await user.save();
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      // Update last login
      await this.userModel.findByIdAndUpdate(user._id, { 
        lastLoginAt: new Date() 
      });

      // Generate tokens
      const payload = { 
        sub: user._id.toString(), 
        email: user.email,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.generateRefreshToken();
      
      // Save refresh token
      await this.saveRefreshToken(user._id.toString(), refreshToken);

      return {
        accessToken,
        refreshToken,
        csrfToken: crypto.randomBytes(64).toString('hex'),
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Google OAuth error:', error);
      throw new UnauthorizedException('Google OAuth authentication failed');
    }
  }

  async facebookOAuth(facebookOAuthDto: FacebookOAuthDto): Promise<AuthResponseDto> {
    const { accessToken: fbAccessToken } = facebookOAuthDto;
    console.log("facebookOAuth___", fbAccessToken);

    try {
      // Verify Facebook access token
      const facebookUserInfo = await this.facebookOAuthService.getFacebookUserInfo(fbAccessToken);
      
      // Check if user already exists by email
      let user = await this.usersService.findByEmail(facebookUserInfo.email);
      
      if (user) {
        // User exists - link Facebook provider if not already linked
        if (!user.facebookProvider) {
          await this.userModel.findByIdAndUpdate(user._id, {
            facebookProvider: {
              facebookId: facebookUserInfo.facebookId,
              email: facebookUserInfo.email,
              name: facebookUserInfo.name,
              picture: facebookUserInfo.picture,
            }
          });
        } else {
          // Update Facebook provider info if it exists
          await this.userModel.findByIdAndUpdate(user._id, {
            'facebookProvider.facebookId': facebookUserInfo.facebookId,
            'facebookProvider.email': facebookUserInfo.email,
            'facebookProvider.name': facebookUserInfo.name,
            'facebookProvider.picture': facebookUserInfo.picture,
          });
        }
      } else {
        // Create new user with Facebook provider (no password)
        user = new this.userModel({
          name: facebookUserInfo.name,
          email: facebookUserInfo.email,
          avatar: facebookUserInfo.picture,
          isVerified: true, // Facebook verified email
          facebookProvider: {
            facebookId: facebookUserInfo.facebookId,
            email: facebookUserInfo.email,
            name: facebookUserInfo.name,
            picture: facebookUserInfo.picture,
          }
        });
        
        user = await user.save();
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      // Update last login
      await this.userModel.findByIdAndUpdate(user._id, { 
        lastLoginAt: new Date() 
      });

      // Generate tokens
      const payload = { 
        sub: user._id.toString(), 
        email: user.email,
        role: user.role,
      };
      const jwtAccessToken = this.jwtService.sign(payload);
      const refreshToken = this.generateRefreshToken();
      
      // Save refresh token
      await this.saveRefreshToken(user._id.toString(), refreshToken);

      return {
        accessToken: jwtAccessToken,
        refreshToken,
        csrfToken: crypto.randomBytes(64).toString('hex'),
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Facebook OAuth error:', error);
      throw new UnauthorizedException('Facebook OAuth authentication failed');
    }
  }
} 