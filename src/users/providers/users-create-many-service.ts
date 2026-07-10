import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

@Injectable()
export class CreateManyUsers {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  public async createMany(createUsersDto: CreateManyUsersDto) {
    const newUsers: User[] = [];

    
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        "query runner couldn't connect",
      );
    }

    try {
      await queryRunner.startTransaction();
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        "query runner couldn't start transaction",
      );
    }

    try {
      for (let user of createUsersDto.users) {
        let newUser = this.userRepository.create(user);
        await queryRunner.manager.save(newUser);
        newUsers.push(newUser);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        error,
        "query runner couldn't commit transaction",
      );
    } finally {
      await queryRunner.release();
    }

    return newUsers;
  }
}
