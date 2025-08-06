export class GroupMessageDto {
  id: string;
  groupMemberId: string;
  user?: { email: string };
  groupId?: string;
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

export class GroupMessageResponseDto {
  contents?: {
    user: string;
    message: string;
  }[];
  room: string;
  error?: string | null;
}
