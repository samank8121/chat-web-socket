import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repository/user.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, UserRepository],
})
export class AuthModule {}
