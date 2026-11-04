// src/setup-app.ts

import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Configuration commune de l'application (utilisée par main.ts et par les tests),
 * pour que les tests vérifient exactement le comportement réel.
 */
export function setupApp(app: NestExpressApplication): NestExpressApplication {
  app.set('trust proxy', 1); // nécessaire derrière un reverse proxy HTTPS (Render, Nginx...)
  app.disable('x-powered-by');

  app.use(helmet()); // en-têtes de sécurité HTTP
  app.enableCors(); // autorise les appels depuis Flutter Web

  // Corps de requête limité à 10 Ko (JSON et form-urlencoded)
  app.useBodyParser('json', { limit: '10kb' });
  app.useBodyParser('urlencoded', { limit: '10kb', extended: false });

  // Validation automatique des DTO ; les champs inconnus sont rejetés
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
}
