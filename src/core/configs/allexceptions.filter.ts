import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? (exception.getResponse() as {
          message?: string | string[];
          statusCode?: number;
          error?: string;
        })
      : { message: 'Internal Server Error' };

    const hasDefaultErrorMessage = () => {
      if (
        exceptionResponse.message &&
        (exceptionResponse.message === 'Bad Request' ||
          exceptionResponse.message === 'Unauthorized' ||
          exceptionResponse.message === 'Forbidden' ||
          exceptionResponse.message === 'Not Found' ||
          exceptionResponse.message === 'Conflict' ||
          exceptionResponse.message === 'Unprocessable Entity' ||
          exceptionResponse.message === 'Too Many Requests' ||
          exceptionResponse.message === 'Internal Server Error')
      ) {
        return true;
      }
      return false;
    };

    const getErrorMessage = (): string | undefined => {
      if (!exceptionResponse.message) {
        return undefined;
      }

      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message[0];
      }

      return exceptionResponse.message;
    };

    this.logger.error(
      '**************************************************************',
    );
    this.logger.error(exception);
    this.logger.error(
      '**************************************************************',
    );

    const errorMessage = getErrorMessage();
    const errorName = isHttpException
      ? exception.name
      : exception instanceof Error
        ? exception.name
        : 'Erreur inconnue';

    const responseBody: Record<string, any> = {
      statusCode: status,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!hasDefaultErrorMessage()) {
      responseBody.message = errorMessage;
    } else {
      responseBody.errorMessage = `Une erreur est survenue. Veuillez reessayer ${status < 500 ? 'plus tard' : ' ou contacter le support'}.`;
    }

    response.status(status).json(responseBody);
  }
}
