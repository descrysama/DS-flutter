// src/auth/auth.controller.ts

import {
  All,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /login (alias /login.php pour rester compatible avec l'API PHP d'origine).
   * Paramètres : email, password (form-urlencoded ou JSON).
   */
  @Post(['login', 'login.php'])
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: Number(process.env.LOGIN_RATE_LIMIT) || 20, ttl: 15 * 60 * 1000 } })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      // Même réponse que pour une saisie invalide : { status: 400, message: "Error" }
      throw new BadRequestException();
    }

    return {
      status: 200,
      message: 'Success',
      ...user,
      token: await this.authService.generateToken(user),
    };
  }

  /** /login n'accepte que POST (ex. ouverture dans un navigateur = GET). */
  @All(['login', 'login.php'])
  loginWrongMethod(): never {
    throw new HttpException('Method not allowed: use POST', HttpStatus.METHOD_NOT_ALLOWED);
  }

  /** GET /me : profil de l'utilisateur connecté (route protégée par token). */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.sub);
    if (!user) throw new UnauthorizedException();

    return { status: 200, message: 'Success', ...user };
  }
}
