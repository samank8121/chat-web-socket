import { Injectable } from '@nestjs/common';
import { GroupMemberRepository } from './repository/group-member.repository';
import { GroupRepository } from './repository/group.repository';
import { GroupMessageRepository } from './repository/group-message.repository';
import { GroupMessageResponseDto } from './dto';

@Injectable()
export class GroupMemberService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
    private readonly groupMessageRepository: GroupMessageRepository,
  ) {}

  async joinGroup(userId: string, groupName: string): Promise<boolean> {
    try {
      let group = await this.groupRepository.findByName(groupName);
      let groupExists = true;
      if (!group) {
        groupExists = false;
        group = await this.groupRepository.create({
          name: groupName,
        });
      }
      let createdGroupMember = null;
      if (groupExists) {
        createdGroupMember = await this.groupMemberRepository.findOne({
          userId_groupId: {
            userId,
            groupId: group.id,
          },
        });
      }
      if (!createdGroupMember) {
        createdGroupMember = await this.groupMemberRepository.create({
          userId,
          groupId: group.id,
        });
      }
      return createdGroupMember ? true : false;
    } catch (error) {
      console.error('Error joining group:', error);
    }
    return false;
  }
  async writeMessageInGroup(
    userId: string,
    groupName: string,
    content: string,
  ): Promise<boolean> {
    try {
      const group = await this.groupRepository.findByName(groupName);
      if (!group) {
        throw new Error(`Group ${groupName} does not exist`);
      }
      const groupMember = await this.groupMemberRepository.findOne({
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      });
      const groupMessage = await this.groupMessageRepository.create({
        groupMemberId: groupMember.id,
        content,
      });
      return groupMessage ? true : false;
    } catch (error) {
      console.error('Error joining group:', error);
    }
    return false;
  }
  async getGroupMessages(
    userId: string,
    email: string,
    groupName: string,
  ): Promise<GroupMessageResponseDto[] | []> {
    try {
      const group = await this.groupRepository.findByName(groupName);
      if (!group) {
        throw new Error(`Group ${groupName} does not exist`);
      }
      const groupMember = await this.groupMemberRepository.findOne({
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      });
      const messages = await this.groupMessageRepository.findMany(
        {
          groupMemberId: groupMember.id,
        },
        null,
        { createdAt: 'desc' },
        50,
      );
      return messages.map((message) => ({
        content: {
          room: groupName,
          user: email,
          message: message.content,
        },
      })) as GroupMessageResponseDto[];
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [{ error: 'An error occurred' }] as GroupMessageResponseDto[];
    }
  }
}
