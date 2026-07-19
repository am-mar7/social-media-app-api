import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { HashingProvider } from './hashing.provider';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import jwtConfig from '../config/jwt.config';
import { TokensProvider } from './tokens.provider';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly tokensProvider: TokensProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findUserByEmail(signInDto.email);

    let isCorrectPassword = false;
    try {
      isCorrectPassword = await this.hashingProvider.compare(
        signInDto.password,
        user.password!,
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!isCorrectPassword) {
      throw new BadRequestException('Invalid password');
    }

    const {accessToken, refreshToken} = await this.tokensProvider.generateTokens(user);

    return { accessToken, refreshToken };
  }

  public async signUp(createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
    const { email, password } = createUserDto;
    return this.signIn({ email: email!, password: password! });
  }
}
