// src/users/user.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Rôles des utilisateurs (mêmes valeurs que l'API PHP d'origine). */
export enum Role {
  Admin = 1,
  User = 2,
}

/**
 * Table "users" de la base SQLite.
 * Seul le hachage bcrypt du mot de passe est stocké (jamais le mot de passe en clair).
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'integer', default: Role.User })
  role: Role;

  @Column()
  passwordHash: string;
}

/** Utilisateur renvoyé par l'API : jamais de hachage de mot de passe. */
export type PublicUser = Omit<User, 'passwordHash'>;
