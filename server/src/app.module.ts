import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './auth/guard/jwt.guard';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
