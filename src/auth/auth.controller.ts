import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/sign-in.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enums/auth.enum';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { TokensProvider } from './providers/tokens.provider';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthService } from './providers/google-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensProvider: TokensProvider,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('sign-in')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('refresh-token')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.tokensProvider.refreshToken(refreshTokenDto);
  }

  @Post('google')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async googleAuth(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenDto);
  }
}
