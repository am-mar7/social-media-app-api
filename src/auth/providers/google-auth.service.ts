import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import * as config from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from '../config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { UsersService } from 'src/users/providers/users.service';
import { TokensProvider } from './tokens.provider';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient: OAuth2Client;
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensProvider,
  ) {}
  onModuleInit() {
    this.oauthClient = new OAuth2Client(
      this.jwtConfiguration.googleClientId,
      this.jwtConfiguration.googleClientSecret,
    );
  }

  public async authenticate(googleTokenDto: GoogleTokenDto) {
    // verfiy google token
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: googleTokenDto.token,
      audience: this.jwtConfiguration.googleClientId,
    });

    // extract payload from google token
    const payload = ticket.getPayload();
    if (!payload) throw new UnauthorizedException();

    // check if user exists in db
    const existingUser = await this.usersService.findUserByGoogleId(
      payload.sub!,
    );

    // if user exists generate tokens and return it
    if (existingUser) {
      return this.tokensService.generateTokens(existingUser);
    }

    // if not create new user then generate tokens and return it
    const newUser = await this.usersService.createUser({
      firstName: payload.given_name!,
      lastName: payload.family_name!,
      email: payload.email!,
      googleId: payload.sub!,
    });

    // generate tokens and return it
    return this.tokensService.generateTokens(newUser);
  }
}
