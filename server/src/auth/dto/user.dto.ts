import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  id: string;
  email: string;
  hash: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  hash?: string;
}
