import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './auth/guard/jwt.guard';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('REDEIS_THROTTLE_TTL'),
            limit: config.get('REDEIS_THROTTLE_LIMIT'),
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: config.get('REDEIS_HOST'),
            port: config.get('REDEIS_PORT'),
          }),
        ),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('TOKEN_SECRET_KEY'),
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CommonModule,
    RoomModule,
  ],
  providers: [ChatGateway, WsJwtGuard],
})
export class AppModule {}
