// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PublicUser } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  // Hachage factice utilisé quand l'email n'existe pas : la comparaison bcrypt
  // est quand même effectuée, donc le temps de réponse ne révèle pas
  // si un compte existe.
  private readonly dummyHash = bcrypt.hashSync('dummy-password-for-timing', 12);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Vérifie les identifiants. Retourne l'utilisateur (sans hachage) ou null. */
  async validateUser(email: string, password: string): Promise<PublicUser | null> {
    const user = await this.usersService.findByEmail(email);
    const isValid = await bcrypt.compare(password, user?.passwordHash ?? this.dummyHash);

    return user && isValid ? this.usersService.toPublic(user) : null;
  }

  /** Génère le token JWT de l'utilisateur. */
  generateToken(user: PublicUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return this.jwtService.signAsync(payload);
  }

  /** Profil associé au token (utilisé par GET /me). */
  async getProfile(userId: number): Promise<PublicUser | null> {
    const user = await this.usersService.findById(userId);
    return user ? this.usersService.toPublic(user) : null;
  }
}
