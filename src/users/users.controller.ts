import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  ParseIntPipe,
  Patch,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import { User } from './user.entity';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { AuthType } from 'src/auth/enums/auth.enum';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth(AuthType.None)
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

  @Auth(AuthType.Bearer)
  @Post('/create-many')
  public async createMany(
    @Body() createManyUsersDto: CreateManyUsersDto,
  ): Promise<User[]> {
    return await this.usersService.createMany(createManyUsersDto);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id')
  public patchUser(@Body() patchUserDto?: PatchUserDto): string {
    console.log('bodyyyyyyyyyyyyyyyyyyyyy', patchUserDto);
    console.log(patchUserDto, patchUserDto instanceof PatchUserDto);
    return 'user patched';
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  public async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteUser(id);
  }
}
