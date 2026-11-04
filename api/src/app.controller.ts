// src/app.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** Page d'accueil : liste des endpoints disponibles. */
  @Get()
  index() {
    return {
      status: 200,
      message: 'Login API',
      endpoints: {
        'POST /login': 'Paramètres : email, password',
        'GET /me': 'En-tête : Authorization: Bearer <token>',
        'GET /health': "État de l'API",
      },
    };
  }

  @Get('health')
  health() {
    return { status: 200, message: 'OK' };
  }
}
