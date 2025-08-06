import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BaseRepository } from 'src/common/repository/base.repository';
import { ChangePasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: BaseRepository,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.userRepository.create({
        email: dto.email,
        hash,
      });
      return this.signToken(user.id, user.email);
    } catch {
      throw new ForbiddenException('User already exists');
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.userRepository.findOne({
      email: dto.email,
    });
    if (!user) throw new ForbiddenException('Invalid credentials');
    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('Invalid credentials');
    return this.signToken(user.id, user.email);
  }
  async changePassword(dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      email: dto.email,
    });
    if (!user) throw new ForbiddenException('Invalid credentials');
    const pwMatches = await argon.verify(user.hash, dto.oldPassword);

    if (!pwMatches) throw new ForbiddenException('Invalid credentials');

    const hash = await argon.hash(dto.newPassword);
    try {
      const response = await this.userRepository.update(user.id, {
        email: dto.email,
        hash,
      });
      return this.signToken(response.id, response.email);
    } catch {
      throw new ForbiddenException('User already exists');
    }
  }
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('TOKEN_SECRET_KEY');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
