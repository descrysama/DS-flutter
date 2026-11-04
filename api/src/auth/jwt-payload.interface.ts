// src/auth/jwt-payload.interface.ts

import { Role } from '../users/user.entity';

/** Contenu du token JWT. */
export interface JwtPayload {
  sub: number;
  role: Role;
}
