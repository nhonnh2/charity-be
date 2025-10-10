import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto, GoogleOAuthDto, FacebookOAuthDto, LogoutDto } from './dto';
import { UsersService } from '../users/users.service';
import { GoogleOAuthService } from './google-oauth.service';
import { FacebookOAuthService } from './facebook-oauth.service';
import { BusinessException } from '../../core/exceptions';
import { AuthErrorCode, UserErrorCode } from '../../shared/enums/error-codes.enum';

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
    refreshTokenExpiresAt.setMinutes(refreshTokenExpiresAt.getMinutes() + 180); // 30 minutes

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
      throw new BusinessException(
        AuthErrorCode.EMAIL_ALREADY_EXISTS,
        `User with email ${email} already exists`,
        HttpStatus.CONFLICT,
      );
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
      throw new BusinessException(
        AuthErrorCode.INVALID_CREDENTIALS,
        `Invalid login credentials for email: ${email}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Block password login for Google-linked accounts without password
    if (!user.password && user.googleProvider) {
      throw new BusinessException(
        AuthErrorCode.INVALID_CREDENTIALS,
        `Account ${email} is linked with Google OAuth and has no password`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check password
    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordValid) {
      throw new BusinessException(
        AuthErrorCode.INVALID_CREDENTIALS,
        `Invalid password for email: ${email}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new BusinessException(
        UserErrorCode.BANNED,
        `User account ${user._id} is not active. Status: ${user.status}`,
        HttpStatus.FORBIDDEN,
      );
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
    
    // Find user by refresh token with expiration check
    const user = await this.userModel.findOne({
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() },
    });
    
    if (!user) {
      throw new BusinessException(
        AuthErrorCode.INVALID_TOKEN,
        `Invalid or expired refresh token`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new BusinessException(
        UserErrorCode.BANNED,
        `User account ${user._id} is not active. Status: ${user.status}`,
        HttpStatus.FORBIDDEN,
      );
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

  async logout(refreshToken: string): Promise<void> {
    // Tìm user bằng refresh token và clear token
    const user = await this.userModel.findOne({ refreshToken });
    if (user) {
      await this.clearRefreshToken(user._id.toString());
    }
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
        throw new BusinessException(
          UserErrorCode.BANNED,
          `User account ${user._id} is not active. Status: ${user.status}`,
          HttpStatus.FORBIDDEN,
        );
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
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      console.error('Google OAuth error:', error);
      throw new BusinessException(
        AuthErrorCode.OAUTH_FAILED,
        `Google OAuth authentication failed: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
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
        throw new BusinessException(
          UserErrorCode.BANNED,
          `User account ${user._id} is not active. Status: ${user.status}`,
          HttpStatus.FORBIDDEN,
        );
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
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      console.error('Facebook OAuth error:', error);
      throw new BusinessException(
        AuthErrorCode.OAUTH_FAILED,
        `Facebook OAuth authentication failed: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
} 