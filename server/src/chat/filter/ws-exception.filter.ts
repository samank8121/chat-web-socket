import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import errorCode from '../constants';

@Catch(WsException)
export class WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const error = exception.getError();
    client.emit('error', {
      message:
        typeof error === 'string'
          ? error
          : error['message'] || 'An error occurred',
      code: error['code'] || errorCode.UNKNOWN_ERROR,
      status: 'error',
    });
  }
}
