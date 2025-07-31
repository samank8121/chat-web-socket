import { Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupMemberRepository } from './repository/group-member.repository';
import { GroupRepository } from './repository/group.repository';
import { GroupService } from './group.service';

@Module({
  providers: [
    GroupMemberService,
    GroupService,
    GroupMemberRepository,
    GroupRepository,
  ],
  exports: [GroupMemberService, GroupService],
})
export class RoomModule {}
