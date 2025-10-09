import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerRequest } from '@nestjs/throttler';
import { Socket } from 'socket.io';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected async getTracker(
    req: Record<string, any> | Socket,
  ): Promise<string> {
    if (this.isWebSocket(req)) {
      // WebSocket context
      const socket = req as Socket;
      return (socket['user'].sub ?? socket.handshake.address) as string;
    }
    // HTTP context
    return (
      (req as Record<string, any>).user?.id ?? (req as Record<string, any>).ip
    );
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    let customLimit = limit;

    if (this.isWebSocketContext(context)) {
      // WebSocket context
      const socket = context.switchToWs().getClient<Socket>();
      customLimit = socket['user'].role === 'admin' ? 100 : limit;
    } else {
      // HTTP context
      const req = context.switchToHttp().getRequest();
      customLimit = req.user?.role === 'admin' ? 100 : limit;
    }

    return super.handleRequest({ ...requestProps, limit: customLimit, ttl });
  }
  private isWebSocketContext(context: ExecutionContext): boolean {
    return context.getType() === 'ws';
  }

  private isWebSocket(req: Record<string, any> | Socket): req is Socket {
    return 'handshake' in req;
  }
}
