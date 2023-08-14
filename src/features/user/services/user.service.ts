/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { SearchQueryParams } from '../dtos/query-params.dto';
import { CreateUserDto } from 'src/features/user/dtos/create-user.dto';
import { REQUEST } from '@nestjs/core';
import { AppLogger } from '@core/logger';
import { User } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
    @Inject(REQUEST) protected request: Request,
    private logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  public async getAllUsers(query: SearchQueryParams) {
    const [user, count] = await this.userRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      data: user,
      count,
    };
  }

  public async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    return user;
  }

  public async createUser(data: CreateUserDto) {
    const { id } = await this.userRepository.create(data);
    return { id };
  }
}
