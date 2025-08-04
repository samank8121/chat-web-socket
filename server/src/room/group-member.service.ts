import { Inject, Injectable } from '@nestjs/common';
import { GroupMessageResponseDto } from './dto';
import { BaseRepository } from 'src/common/repository/base.repository';

@Injectable()
export class GroupMemberService {
  constructor(
    @Inject('GroupRepository')
    private readonly groupRepository: BaseRepository,
    @Inject('GroupMemberRepository')
    private readonly groupMemberRepository: BaseRepository,
    @Inject('GroupMessageRepository')
    private readonly groupMessageRepository: BaseRepository,
  ) {}

  async joinGroup(userId: string, groupName: string): Promise<boolean> {
    try {
      let group = await this.groupRepository.findOne({ name: groupName });
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
      const group = await this.groupRepository.findOne({ name: groupName });
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
      const group = await this.groupRepository.findOne({ name: groupName });
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
