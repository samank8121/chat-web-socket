import { BaseRepository } from 'src/common/repository/base.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto, UserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UserRepository extends BaseRepository<
  UserDto,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'user');
  }
}
