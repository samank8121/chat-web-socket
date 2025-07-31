import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BaseRepository } from 'src/common/repository/base.repository';
import {
  GroupMemberDto,
  CreateGroupMemberDto,
  UpdateGroupMemberDto,
} from '../dto/group-member.dto';

@Injectable()
export class GroupMemberRepository extends BaseRepository<
  GroupMemberDto,
  CreateGroupMemberDto,
  UpdateGroupMemberDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'groupMember');
  }
}
