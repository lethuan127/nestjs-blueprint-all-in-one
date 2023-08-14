/* eslint-disable prettier/prettier */
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

import { AppLogger } from '@core/logger';
@Injectable()
export class AuthService {
  constructor(
    public readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }


  public async getMyInfo(user: Request['user']) {
    return {
      ...user,
    };
  }
}
