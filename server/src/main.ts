import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import corsConfig from './common/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
