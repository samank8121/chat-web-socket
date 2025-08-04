import { Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupService } from './group.service';
import { createRepositoryClass } from 'src/common/repository/base.respository.factory';
import {
  CreateGroupDto,
  CreateGroupMemberDto,
  CreateGroupMessageDto,
  GroupDto,
  GroupMemberDto,
  GroupMessageDto,
  UpdateGroupDto,
  UpdateGroupMemberDto,
  UpdateGroupMessageDto,
} from './dto';

@Module({
  providers: [
    GroupMemberService,
    GroupService,
    {
      provide: 'GroupRepository',
      useClass: createRepositoryClass<GroupDto, CreateGroupDto, UpdateGroupDto>(
        'group',
      ),
    },
    {
      provide: 'GroupMemberRepository',
      useClass: createRepositoryClass<
        GroupMemberDto,
        CreateGroupMemberDto,
        UpdateGroupMemberDto
      >('groupMember'),
    },
    {
      provide: 'GroupMessageRepository',
      useClass: createRepositoryClass<
        GroupMessageDto,
        CreateGroupMessageDto,
        UpdateGroupMessageDto
      >('groupMessage'),
    },
  ],
  exports: [GroupMemberService, GroupService],
})
export class RoomModule {}
