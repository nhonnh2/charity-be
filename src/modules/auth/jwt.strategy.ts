import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import type { Request } from 'express';


const ACCESS_COOKIE = 'accessToken';

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.[ACCESS_COOKIE] ?? null;
}

// Ưu tiên Bearer > Cookie
const BearerOrCookie = (req: Request) =>
  ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? cookieExtractor(req);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      
      jwtFromRequest: ExtractJwt.fromExtractors([BearerOrCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return user;
  }
} 