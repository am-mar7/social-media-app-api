import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async getUsersFromDatabase() {
    try {
      return await this.userRepository.find();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser: User | null = null;

    try {
      existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (existingUser) {
      throw new BadRequestException('This user is already registered', {
        description: 'The user with this email is already registered',
      });
    }

    let user = this.userRepository.create(createUserDto);

    try {
      user.password = await this.hashingProvider.hash(createUserDto.password);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        error,
        'Failed to hash the user password',
      );
    }

    try {
      user = await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return user;
  }

  public async findUserById(id: number) {
    let user: User | null = null;

    try {
      user = await this.userRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!user) {
      throw new BadRequestException('User not found', {
        description: 'The user with this ID is not found',
      });
    }
    return user;
  }

  public async findUserByEmail(email: string) {
    let user: User | null = null;

    try {
      user = await this.userRepository.findOneBy({ email });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!user) {
      throw new BadRequestException('User not found', {
        description: 'The user with this ID is not found',
      });
    }
    return user;
  }

  public async deleteUser(id: number) {
    const user = await this.findUserById(id);

    try {
      await this.userRepository.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        error,
        'Failed to delete the user',
      );
    }

    return user;
  }
}
