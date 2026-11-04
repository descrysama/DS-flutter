// src/main.ts
// Point d'entrée : démarre l'API en HTTP, ou en HTTPS si un certificat est fourni.

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  // Si SSL_KEY_PATH et SSL_CERT_PATH sont définis, l'API est servie directement en HTTPS.
  // Sinon elle tourne en HTTP (développement local, ou derrière un hébergeur qui fournit le HTTPS).
  const { SSL_KEY_PATH, SSL_CERT_PATH } = process.env;
  const httpsOptions =
    SSL_KEY_PATH && SSL_CERT_PATH
      ? { key: readFileSync(SSL_KEY_PATH), cert: readFileSync(SSL_CERT_PATH) }
      : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    bodyParser: false, // les parseurs sont configurés dans setupApp (taille limitée)
  });
  setupApp(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  new Logger('Bootstrap').log(
    `API démarrée sur ${httpsOptions ? 'https' : 'http'}://localhost:${port}`,
  );
}

void bootstrap();
