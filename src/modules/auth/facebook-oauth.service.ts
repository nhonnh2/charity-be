import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface FacebookUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

@Injectable()
export class FacebookOAuthService {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('FACEBOOK_CLIENT_ID');
    this.appSecret = this.configService.get<string>('FACEBOOK_CLIENT_SECRET');
  }

  async verifyAccessToken(accessToken: string): Promise<FacebookUserInfo> {
    try {
      // Verify access token with Facebook
      const verifyResponse = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );

      const userInfo = verifyResponse.data;

      if (!userInfo || !userInfo.id) {
        throw new UnauthorizedException('Invalid Facebook access token');
      }

      // Verify the token is valid by checking app_id
      const debugResponse = await axios.get(
        `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${this.appId}|${this.appSecret}`
      );

      const debugData = debugResponse.data.data;
      
      if (!debugData || !debugData.is_valid || debugData.app_id !== this.appId) {
        throw new UnauthorizedException('Invalid Facebook access token');
      }

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Facebook OAuth verification error:', error);
      throw new UnauthorizedException('Failed to verify Facebook access token');
    }
  }

  async getFacebookUserInfo(accessToken: string): Promise<{
    facebookId: string;
    email: string;
    name: string;
    picture?: string;
  }> {
    const userInfo = await this.verifyAccessToken(accessToken);
    
    return {
      facebookId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture?.data?.url,
    };
  }
}
