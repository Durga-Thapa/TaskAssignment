import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const response = exception.getResponse();

      // Type-safe guard
      if (typeof response === 'string') {
        message = response;
      } else if (
        response &&
        typeof response === 'object' &&
        'message' in response
      ) {
        const msg = (response as { message?: string | string[] }).message;
        message = Array.isArray(msg) ? msg : (msg ?? 'An error occurred');
      } else {
        message = 'An error occurred';
      }
    }
    // Handle native JS errors
    else if (exception instanceof Error) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }
    // Fallback for unknown types
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unexpected error occurred';
    }

    // Optional: logging
    console.error('Exception caught by filter:', exception);

    res.status(status).json({
      success: false,
      statusCode: status,
      path: req.url,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
