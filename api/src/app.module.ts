// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Charge le fichier .env et rend la configuration accessible partout
    ConfigModule.forRoot({ isGlobal: true }),
    // Limitation du nombre de requêtes (appliquée sur /login via ThrottlerGuard)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
