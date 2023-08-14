import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    ctx.getResponse();

    if (exception instanceof HttpException) {
      return httpAdapter.reply(ctx.getResponse(), exception.getResponse(), exception.getStatus());
    }

    if (exception instanceof Error) {
      const responseBody = {
        error: InternalServerErrorException.name,
        message: exception.message,
        stack: exception.stack,
      };

      return httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const responseBody = {
      error: InternalServerErrorException.name,
      message: 'Internal Server Error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
