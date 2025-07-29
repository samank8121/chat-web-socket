import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('WsJwtGuard activated');
    // Get the WebSocket client from the context
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHandshake(client);
    console.log('Received token:', token);
    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      // Verify the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('TOKEN_SECRET_KEY'),
      });

      // Optionally attach the payload to the client for use in handlers
      client['user'] = payload;
      return true;
    } catch {
      throw new WsException('Unauthorized: Invalid token');
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
