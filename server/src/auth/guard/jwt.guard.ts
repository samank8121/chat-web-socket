import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import errorCode from 'src/chat/constants';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHandshake(client);
    console.log('Token received:', token);
    if (!token) {
      throw new WsException({
        message: 'Unauthorized: No token provided',
        code: errorCode.NO_TOKEN_PROVIDED,
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('TOKEN_SECRET_KEY'),
      });
      console.log('Token payload:', payload);
      client['user'] = payload;
      return true;
    } catch {
      console.log('Invalid token');
      throw new WsException({
        message: 'Unauthorized: Invalid token',
        code: errorCode.INVALID_TOKEN,
      });
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // Extract token from query params, headers, or cookies
    const token =
      client.handshake.query?.token ||
      client.handshake.headers?.authorization?.split(' ')[1] ||
      client.handshake.auth?.token;

    return token;
  }
}
