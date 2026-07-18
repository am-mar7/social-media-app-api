import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import * as config from '@nestjs/config';
import { IActiveUser } from '../interfaces/activeUser.interface';
import { User } from 'src/users/user.entity';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class TokensProvider {
  private logger = new Logger(TokensProvider.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly usersService: UsersService,
  ) {}

  private async signToken<T>(userId: number, expiresIn: number, payload: T) {
    return await this.jwtService.signAsync(
      {
        id: userId,
        ...payload,
      },
      {
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: expiresIn,
        secret: this.jwtConfiguration.secret,
      },
    );
  }

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
      }),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        email: user.email,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { id } = await this.jwtService.verifyAsync<Pick<IActiveUser, 'id'>>(
        refreshTokenDto.refreshToken,
        {
          issuer: this.jwtConfiguration.issuer,
          audience: this.jwtConfiguration.audience,
          secret: this.jwtConfiguration.secret,
        },
      );

      const user = await this.usersService.findUserById(id);

      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
