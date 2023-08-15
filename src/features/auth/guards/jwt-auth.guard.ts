import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';

import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IJwtPayload } from '@auth/interfaces/jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    if (this.routeIsPublic(context)) {
      return true;
    }

    const tokenIsRevoked = await this.tokenIsRevoked(context);

    if (tokenIsRevoked) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as IJwtPayload;
      request['user'] = {
        ...payload,
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

  private async tokenIsRevoked(context: ExecutionContext): Promise<boolean> {
    const contextArgs: any = context.getArgs();
    const authorizationHeader = contextArgs[0].headers?.authorization;

    if (!authorizationHeader) {
      return true;
    }

    const access_token = authorizationHeader.split(' ')?.[1];

    if (!access_token) {
      return true;
    }

    const isTokenRevoked = await this.tokenInBlacklist(access_token);

    if (isTokenRevoked) {
      return true;
    }

    return false;
  }

  private async tokenInBlacklist(access_token: string): Promise<boolean> {
    const decodeToken: any = this.jwtService.decode(access_token);
    const jti = decodeToken.jti;

    return (await this.cacheManager.get(jti)) || false;
  }
}
