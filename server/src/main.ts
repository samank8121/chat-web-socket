import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import corsConfig from './common/cors.config';
import { ThrottlerExceptionFilter } from './common/throttle-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);
  app.useGlobalFilters(new ThrottlerExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
