import { Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupMemberRepository } from './repository/group-member.repository';
import { GroupRepository } from './repository/group.repository';
import { GroupService } from './group.service';
import { GroupMessageRepository } from './repository/group-message.repository';

@Module({
  providers: [
    GroupMemberService,
    GroupService,
    GroupMemberRepository,
    GroupRepository,
    GroupMessageRepository,
  ],
  exports: [GroupMemberService, GroupService],
})
export class RoomModule {}
