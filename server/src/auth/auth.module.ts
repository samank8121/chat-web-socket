import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto';
import { createRepositoryClass } from 'src/common/repository/base.respository.factory';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    {
      provide: 'UserRepository',
      useClass: createRepositoryClass<UserDto, CreateUserDto, UpdateUserDto>(
        'user',
      ),
    },
  ],
})
export class AuthModule {}
