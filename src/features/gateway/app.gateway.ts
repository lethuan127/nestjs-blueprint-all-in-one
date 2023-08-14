import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WSJwtAuthGuard } from './ws-jwt-auth.guard';

@UseGuards(WSJwtAuthGuard)
@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(AppGateway.name);
  constructor(public readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    this.logger.log(client.id, 'Connected..............................');
    const user = await this.verifyClient(client);
    client.join(`U.${user.userId}`);
    client.join(`A.${user.clientId}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(client.id, 'Disconnect');
  }

  @SubscribeMessage('messages')
  async messages(client: Socket, payload: string) {
    this.logger.log(payload);
  }

  async verifyClient(client: Socket): Promise<Request['user']> {
    const access_token: any = client.handshake?.query?.token;
    if (!access_token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    try {
      const user = this.jwtService.verify<Request['user']>(access_token);
      return user;
    } catch (ex) {
      throw new UnauthorizedException({ statusCode: 401, message: 'Unauthorized' });
    }
  }
}
