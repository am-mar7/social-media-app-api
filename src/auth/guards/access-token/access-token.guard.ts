import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/auth/config/jwt.config';
import * as config from '@nestjs/config';
import { Payload } from 'src/auth/interfaces/payload.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: Payload }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: Payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      request.user = payload;
      console.log(payload);
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid Access Token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
