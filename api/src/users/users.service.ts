// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import usersData from './data/users.json';
import { PublicUser, User } from './user.entity';

/**
 * Accès aux utilisateurs.
 * Les données viennent d'un fichier JSON qui ne contient que les hachages bcrypt
 * des mots de passe (jamais les mots de passe en clair).
 */
@Injectable()
export class UsersService {
  private readonly users: User[] = usersData as User[];

  findByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  /** Retire le hachage du mot de passe avant de renvoyer l'utilisateur. */
  toPublic(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
