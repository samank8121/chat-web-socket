import { Injectable } from '@nestjs/common';
import { CreateGroupDto, GroupDto, UpdateGroupDto } from './dto/group.dto';
import { GroupRepository } from './repository/group.repository';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

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
    const group = await this.groupRepository.findByName(name);
    return group && group.name !== null;
  }
}
