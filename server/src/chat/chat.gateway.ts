import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guard/jwt.guard';
import { WsExceptionFilter } from './filter/ws-exception.filter';
import { GroupMemberService } from 'src/room/group-member.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000', 'https://admin.socket.io'],
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  constructor(private readonly groupMemberService: GroupMemberService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
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
  async handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    const joined = await this.groupMemberService.joinGroup(
      client['user'].sub,
      room,
    );
    //TODO: return saved messages
    client.join(room);
    return `You joined room: ${room}, joined: ${joined}`;
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
    // TODO: Save message in database or perform any other logic here
    //save message in database or perform any other logic here
    client.broadcast.to(room).emit('receive_message', {
      user: client['user'].email,
      message: messageSent,
    });
  }
}
