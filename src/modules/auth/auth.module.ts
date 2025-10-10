import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleOAuthService } from './google-oauth.service';
import { FacebookOAuthService } from './facebook-oauth.service';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '120m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleOAuthService, FacebookOAuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 