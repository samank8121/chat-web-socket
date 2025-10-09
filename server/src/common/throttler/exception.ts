import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 429;

    response.status(status).json({
      statusCode: status,
      message: 'You have made too many requests. Please try again later.',
      error: 'Too Many Requests',
      retryAfter: exception.getResponse()['retry-after'] || 60, // Optional: Include retry-after if provided
    });
  }
}
