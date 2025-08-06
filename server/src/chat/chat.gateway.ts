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
    const joinGroup = await this.groupMemberService.joinGroup(
      client['user'].sub,
      room,
    );
    client.join(room);
    console.log(joinGroup);
    if (!joinGroup.joined) {
      return { error: 'There is a problem in joining group try later' };
    }
    if (!joinGroup.newGroup) {
      const messages = await this.groupMemberService.getGroupMessages(
        client['user'].email,
        room,
      );
      return messages;
    }
    return { room };
  }
  @SubscribeMessage('leave_room')
  async handleLeftRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(room);
    return true;
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { messageSent: string; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { messageSent, room } = data;
    console.log(
      `Message received from ${client['user'].sub} in room ${room}: ${messageSent}`,
    );
    const messageCreated = await this.groupMemberService.writeMessageInGroup(
      client['user'].sub,
      room,
      messageSent,
    );
    if (messageCreated) {
      client.broadcast.to(room).emit('receive_message', {
        room: room,
        user: client['user'].email,
        message: messageSent,
      });
    } else {
      console.error(`Failed to send message to room ${room}`);
      return {
        error: `Failed to send message to room ${room}`,
      };
    }
  }
}
