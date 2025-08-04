import { Inject, Injectable } from '@nestjs/common';
import { CreateGroupDto, GroupDto, UpdateGroupDto } from './dto/group.dto';
import { BaseRepository } from 'src/common/repository/base.repository';

@Injectable()
export class GroupService {
  constructor(
    @Inject('GroupRepository')
    private readonly groupRepository: BaseRepository,
  ) {}

  async createGroup(data: CreateGroupDto): Promise<GroupDto> {
    return this.groupRepository.create(data);
  }

  async findGroupById(id: string): Promise<GroupDto | null> {
    return this.groupRepository.findById(id);
  }

  async updateGroup(id: string, data: UpdateGroupDto): Promise<GroupDto> {
    return this.groupRepository.update(id, data);
  }

  async deleteGroup(id: string): Promise<GroupDto> {
    return this.groupRepository.delete(id);
  }
  async existsGroup(name: string): Promise<boolean> {
    const group = await this.groupRepository.findOne({ name });
    return group && group.name !== null;
  }
}
