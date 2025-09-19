import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  nonce?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.client = new OAuth2Client();
  }

  async verifyIdToken(idToken: string, expectedNonce?: string): Promise<GoogleTokenPayload> {
    try {
      // Verify the ID token
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload() as GoogleTokenPayload;

      if (!payload) {
        throw new UnauthorizedException('Invalid ID token');
      }

      // Verify issuer
      const validIssuers = [
        'https://accounts.google.com',
        'accounts.google.com'
      ];
      
      if (!validIssuers.includes(payload.iss)) {
        throw new UnauthorizedException('Invalid token issuer');
      }

      // Verify audience
      const expectedAudience = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (payload.aud !== expectedAudience) {
        throw new UnauthorizedException('Invalid token audience');
      }

      // Verify nonce if provided
      if (expectedNonce && payload.nonce !== expectedNonce) {
        throw new UnauthorizedException('Invalid nonce');
      }

      // Verify email is verified
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new UnauthorizedException('Token has expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Google OAuth verification error:', error);
      throw new UnauthorizedException('Failed to verify Google ID token');
    }
  }

  async getGoogleUserInfo(idToken: string, expectedNonce?: string) {
    const payload = await this.verifyIdToken(idToken, expectedNonce);
    
    return {
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
