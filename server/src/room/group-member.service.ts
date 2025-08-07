import { Inject, Injectable } from '@nestjs/common';
import { GroupMessageResponseDto, JoinGroup } from './dto';
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

  async joinGroup(userId: string, groupName: string): Promise<JoinGroup> {
    let result = { joined: false, newGroup: false };
    try {
      let group = await this.groupRepository.findOne({ name: groupName });
      if (!group) {
        group = await this.groupRepository.create({
          name: groupName,
        });

        await this.groupMemberRepository.create({
          userId,
          groupId: group.id,
        });
        result = { joined: true, newGroup: true };
        return result;
      } else {
        const groupMember = await this.groupMemberRepository.findOne({
          user: {
            id: userId,
          },
          group: {
            id: group.id,
          },
        });
        if (!groupMember) {
          await this.groupMemberRepository.create({
            userId,
            groupId: group.id,
          });
        }
        result = { joined: true, newGroup: false };
      }

      return result;
    } catch (error) {
      console.error('Error joining group:', error);
    }
    return result;
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
        user: {
          id: userId,
        },
        group: {
          id: group.id,
        },
      });
      const groupMessage = await this.groupMessageRepository.create({
        groupMemberId: groupMember.id,
        content,
      });
      return groupMessage ? true : false;
    } catch (error) {
      console.error('Error writing message to group:', error);
    }
    return false;
  }
  async getGroupMessages(
    email: string,
    groupName: string,
  ): Promise<GroupMessageResponseDto> {
    try {
      const group = await this.groupRepository.findOne({ name: groupName });
      if (!group) {
        throw new Error(`Group ${groupName} does not exist`);
      }

      const isGroupMember = await this.groupMemberRepository.findOne({
        group: {
          id: group.id,
        },
        user: {
          email: email,
        },
      });
      if (isGroupMember) {
        const groupMembers = await this.groupMemberRepository.findMany(
          {
            groupId: group.id,
          },
          null,
          { id: true },
        );
        let contents = [];
        if (groupMembers && groupMembers.length > 0) {
          const groupMemberIds = groupMembers.map((member) => member.id);
          const messages = await this.groupMessageRepository.findMany(
            {
              groupMemberId: {
                in: groupMemberIds,
              },
            },
            {
              groupMember: {
                include: {
                  user: true,
                },
              },
            },
            null,
            { createdAt: 'asc' },
            50,
          );
          contents = messages.map((message) => ({
            user: message.groupMember.user.email,
            message: message.content,
          }));
        }

        return { room: groupName, contents };
      } else {
        return {
          error: 'You are not part of this group',
        } as GroupMessageResponseDto;
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return { error: 'An error occurred' } as GroupMessageResponseDto;
    }
  }
}
