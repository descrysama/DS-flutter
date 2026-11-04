// src/app.module.ts

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Charge le fichier .env et rend la configuration accessible partout
    ConfigModule.forRoot({ isGlobal: true }),
    // Base de données SQLite (un simple fichier, aucun serveur à installer)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const database = config.get<string>('DATABASE_PATH', 'data/database.sqlite');
        if (database !== ':memory:') {
          mkdirSync(dirname(database), { recursive: true });
        }
        return {
          type: 'better-sqlite3',
          database,
          entities: [User],
          // Crée / met à jour les tables à partir des entités (suffisant pour ce projet)
          synchronize: true,
        };
      },
    }),
    // Limitation du nombre de requêtes (appliquée sur /login via ThrottlerGuard)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
