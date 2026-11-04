// scripts/create-user.ts
// Ajoute un utilisateur dans la base SQLite (mot de passe haché avec bcrypt).
// Usage : npm run user:create -- <email> <motDePasse> <prénom> <nom> [rôle: 1=admin, 2=utilisateur]

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Role } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';

async function main() {
  const [email, password, firstName, lastName, role] = process.argv.slice(2);

  if (!email || !password || !firstName || !lastName) {
    console.error(
      'Usage : npm run user:create -- <email> <motDePasse> <prénom> <nom> [rôle: 1=admin, 2=utilisateur]',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });

  try {
    const user = await app.get(UsersService).create({
      email,
      password,
      firstName,
      lastName,
      role: role === '1' ? Role.Admin : Role.User,
    });
    console.log('Utilisateur créé :', user);
  } catch (error) {
    console.error('Erreur :', (error as Error).message);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void main();
