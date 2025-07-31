import { Injectable } from '@nestjs/common';
import { GroupMemberRepository } from './repository/group-member.repository';
import { GroupRepository } from './repository/group.repository';

@Injectable()
export class GroupMemberService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  async joinGroup(userId: string, group: string): Promise<boolean> {
    try {
      let createdGroup = await this.groupRepository.findByName(group);
      if (!createdGroup) {
        createdGroup = await this.groupRepository.create({
          name: group,
        });
      }
      const createdGroupMember = await this.groupMemberRepository.create({
        userId,
        groupId: createdGroup.id,
      });
      return createdGroupMember ? true : false;
    } catch (error) {
      console.error('Error joining group:', error);
    }
    return false;
  }
}
