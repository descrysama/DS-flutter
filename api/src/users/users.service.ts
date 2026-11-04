// src/users/users.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { PublicUser, Role, User } from './user.entity';

/** Données nécessaires pour créer un utilisateur. */
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}

/** Accès à la table "users" de la base SQLite. */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email: email.toLowerCase() });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  count(): Promise<number> {
    return this.usersRepository.count();
  }

  /** Crée un utilisateur : le mot de passe est haché (et salé) avec bcrypt. */
  async create(input: CreateUserInput): Promise<PublicUser> {
    const email = input.email.toLowerCase();
    if (await this.findByEmail(email)) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const user = this.usersRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      role: input.role ?? Role.User,
      passwordHash: await bcrypt.hash(input.password, 12),
    });

    return this.toPublic(await this.usersRepository.save(user));
  }

  /** Retire le hachage du mot de passe avant de renvoyer l'utilisateur. */
  toPublic(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
