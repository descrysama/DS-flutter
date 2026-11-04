// src/users/user.entity.ts

/** Rôles des utilisateurs (mêmes valeurs que l'API PHP d'origine). */
export enum Role {
  Admin = 1,
  User = 2,
}

/** Utilisateur tel qu'il est stocké (avec le hachage bcrypt du mot de passe). */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  passwordHash: string;
}

/** Utilisateur renvoyé par l'API : jamais de hachage de mot de passe. */
export type PublicUser = Omit<User, 'passwordHash'>;
