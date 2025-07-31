import { IsNotEmpty } from 'class-validator';

export class GroupMemberDto {
  id: string;
  groupId: string;
  userId: string;
}

export class CreateGroupMemberDto {
  @IsNotEmpty()
  groupId: string;

  @IsNotEmpty()
  userId: string;
}
export class UpdateGroupMemberDto {
  @IsNotEmpty()
  groupId: string;

  @IsNotEmpty()
  userId: string;
}
