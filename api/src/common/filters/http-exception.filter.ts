// src/common/filters/http-exception.filter.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/** Messages renvoyés selon le code HTTP. */
const MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Error',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.NOT_FOUND]: 'Not found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method not allowed: use POST',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Error',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests',
};

/**
 * Formate toutes les erreurs au format attendu par l'application Flutter :
 *   { "status": <code>, "message": "<message>" }
 * Les détails internes (validation, pile d'erreur) ne sont jamais renvoyés au client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    // Erreurs Nest (HttpException) ou erreurs du parseur de corps (JSON invalide...)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (typeof (exception as { status?: unknown })?.status === 'number') {
      status = (exception as { status: number }).status;
    }

    if (status >= 500) {
      this.logger.error(exception);
    }

    if (status === HttpStatus.METHOD_NOT_ALLOWED) {
      response.setHeader('Allow', 'POST');
    }

    response.status(status).json({
      status,
      message: MESSAGES[status] ?? (status >= 500 ? 'Internal server error' : 'Error'),
    });
  }
}
