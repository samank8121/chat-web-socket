import { IsNotEmpty } from 'class-validator';

export class GroupDto {
  id: string;
  name: string;
}

export class CreateGroupDto {
  @IsNotEmpty()
  name: string;
}
export class UpdateGroupDto {
  @IsNotEmpty()
  name: string;
}
