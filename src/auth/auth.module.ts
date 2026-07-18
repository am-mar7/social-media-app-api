import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';
import { BcryptProvider } from './providers/bcyrpt.provider';
import { HashingProvider } from './providers/hashing.provider';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { TokensProvider } from './providers/tokens.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: HashingProvider, useClass: BcryptProvider },
    TokensProvider,
  ],
  exports: [AuthService, HashingProvider],
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
})
export class AuthModule {}
