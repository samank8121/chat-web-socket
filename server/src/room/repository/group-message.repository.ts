import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BaseRepository } from 'src/common/repository/base.repository';
import {
  CreateGroupMessageDto,
  GroupMessageDto,
  UpdateGroupMessageDto,
} from '../dto';

@Injectable()
export class GroupMessageRepository extends BaseRepository<
  GroupMessageDto,
  CreateGroupMessageDto,
  UpdateGroupMessageDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'groupMessage');
  }
}
