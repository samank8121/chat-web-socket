import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000', 'https://admin.socket.io'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit() {
    instrument(this.server, {
      auth: false,
      mode: 'development',
      namespaceName: '/admin',
    });
  }
  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}, ${client.nsp.name}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): string {
    console.log('server recieve message', message);
    return message;
  }
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
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
    client.broadcast.to(room).emit('receive_message', { message: messageSent });
  }
}
