import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { GetUserParamsDto } from './dtos/get-user-params.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import { User } from './user.entity';
import { CreateManyUsers } from './providers/users-create-many-service';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly createManyUsers: CreateManyUsers,
  ) {}

  @Get()
  public async getUsers() {
    return await this.usersService.getUsersFromDatabase();
  }

  @Post()
  public async createUser(
    @Body() createUserDto?: CreateUserDto,
    @Headers() headers?: any,
    @Ip() ip?: string,
  ): Promise<User | null> {
    console.log('bodyyyyyyyyyyyyyyyyyyyyy', createUserDto);
    console.log('headerrrrrrrrrrrrrrrrrr', headers);
    console.log('ippppppppppppppppppp', ip);
    console.log(createUserDto, createUserDto instanceof CreateUserDto);
    if (createUserDto) {
      return await this.usersService.createUser(createUserDto);
    }
    return null;
  }

  @UseGuards(AccessTokenGuard)
  @Post('/create-many')
  public async createMany(
    @Body() createUsersDto: CreateManyUsersDto,
  ): Promise<User[]> {
    return await this.createManyUsers.createMany(createUsersDto);
  }

  @Patch(':id')
  public patchUser(@Body() patchUserDto?: PatchUserDto): string {
    console.log('bodyyyyyyyyyyyyyyyyyyyyy', patchUserDto);
    console.log(patchUserDto, patchUserDto instanceof PatchUserDto);
    return 'user patched';
  }

  @Delete(':id')
  public async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteUser(id);
  }
}
