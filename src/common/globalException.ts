import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { statusCode, message } = this.extractErrorDetails(exception);

    this.logger.error(
      `HTTP ${statusCode} Error: ${req.method} ${req.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  private extractErrorDetails(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { statusCode, message: response };
      }

      if (response && typeof response === 'object' && 'message' in response) {
        const msg = (response as { message?: unknown }).message;

        return {
          statusCode,
          message: Array.isArray(msg)
            ? msg.map(String)
            : typeof msg === 'string'
              ? msg
              : 'An error occurred',
        };
      }

      return { statusCode, message: 'An error occurred' };
    }

    // Handle generic JS errors
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      };
    }

    // Unknown error fallback
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error occurred',
    };
  }
}
