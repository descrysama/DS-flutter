// src/users/users.seeder.ts

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Role } from './user.entity';
import { UsersService } from './users.service';

/**
 * Au démarrage, si la table "users" est vide, elle est remplie
 * avec les comptes de test (voir README).
 */
@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    if ((await this.usersService.count()) > 0) return;

    await this.usersService.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      password: 'userpass',
      role: Role.User,
    });
    await this.usersService.create({
      firstName: 'Julie',
      lastName: 'Martin',
      email: 'julie@example.com',
      password: 'adminpass',
      role: Role.Admin,
    });

    if (process.env.NODE_ENV !== 'test') {
      this.logger.log('Base vide : utilisateurs de test créés');
    }
  }
}
