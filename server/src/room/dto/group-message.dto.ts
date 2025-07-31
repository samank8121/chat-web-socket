export class GroupMessageDto {
  id: string;
  groupMemberId: string;
  content: string;
}

export class CreateGroupMessageDto {
  groupMemberId: string;
  content: string;
}
export class UpdateGroupMessageDto {
  groupMemberId: string;

  content: string;
}
