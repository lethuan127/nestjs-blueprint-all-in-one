import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WSJwtAuthGuard implements CanActivate {
  constructor(public readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean | any | Promise<boolean | any>> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const access_token: any = client.handshake?.query?.token;

    if (!access_token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    try {
      const user = this.jwtService.verify<Request['user']>(access_token);
      context.switchToWs().getData().user = user;
      return user;
    } catch (error) {
      return false;
    }
  }
}
