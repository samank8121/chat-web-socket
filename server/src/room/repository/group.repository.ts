import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BaseRepository } from 'src/common/repository/base.repository';
import { CreateGroupDto, GroupDto, UpdateGroupDto } from '../dto/group.dto';

@Injectable()
export class GroupRepository extends BaseRepository<
  GroupDto,
  CreateGroupDto,
  UpdateGroupDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'group');
  }
  async findByName(name: string): Promise<GroupDto | null> {
    return this.findOne({ name });
  }
}
