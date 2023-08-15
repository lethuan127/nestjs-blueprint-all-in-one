import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

import { AppLogger } from '@core/logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
