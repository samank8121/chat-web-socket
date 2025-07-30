import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
//import { instrument } from '@socket.io/admin-ui';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guard/jwt.guard';
import { WsExceptionFilter } from './filter/ws-exception.filter';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000', 'https://admin.socket.io'],
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor() {}
  afterInit() {
    // instrument(this.server, {
    //   auth: false,
    //   mode: 'development',
    //   namespaceName: '/admin',
    // });
  }
  handleConnection(@ConnectedSocket() client: Socket) {
    // const token = client.handshake?.headers?.authorization?.split(' ')[1];
    // try {
    //   const payload = this.jwtService.verify(token);
    //   client.data = { user: payload }; // Attach user to client
    // } catch {
    //   client.disconnect(); // Invalid token: disconnect
    // }
    console.log(`Client connected: ${client.id}, ${client.nsp.name}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('server recieve message', message);
    console.log('server recieve user', client['user'] ?? 'No user attached');
    return message;
  }
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('server recieve room', room);
    client.join(room);
    return `You joined room: ${room}`;
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody() data: { messageSent: string; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { messageSent, room } = data;
    console.log(
      `Message received from ${client.id} in room ${room}: ${messageSent}`,
    );
    client.broadcast.to(room).emit('receive_message', {
      user: client['user'].email,
      message: messageSent,
    });
  }
}
