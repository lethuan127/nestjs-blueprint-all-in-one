import {
  CACHE_MANAGER,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';

import { IS_PUBLIC_KEY } from 'src/features/auth/decorators/public.decorator';
import { Request } from 'express';
import { AuthorizeService } from 'src/common/services/authorize.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authorizeService: AuthorizeService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    if (this.routeIsPublic(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['token'] as string;
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.authorizeService.getUserInfomation(token);
      request['user'] = {
        ...user,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private routeIsPublic(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return false;
  }
}
