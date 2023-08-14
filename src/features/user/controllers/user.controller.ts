import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from 'src/features/user/services/user.service';
import { CreateUserDto } from 'src/features/user/dtos/create-user.dto';
import { SearchQueryParams } from 'src/features/user/dtos/query-params.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async createUser(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body);
  }

  @Get()
  public async getAllUsers(@Query() queryParams: SearchQueryParams) {
    return await this.userService.getAllUsers(queryParams);
  }

  @Get('/:id')
  public async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }
}
