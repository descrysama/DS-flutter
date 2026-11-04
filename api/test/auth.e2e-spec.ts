// test/auth.e2e-spec.ts
// Tests de bout en bout de l'API (npm test).

process.env.NODE_ENV = 'test';

import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';

describe('API d\'authentification (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
    setupApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  const login = (fields: Record<string, string>) =>
    request(app.getHttpServer()).post('/login').type('form').send(fields);

  it('connexion réussie : renvoie le profil et un token', async () => {
    const res = await login({ email: 'jean@example.com', password: 'userpass' }).expect(200);

    expect(res.body).toMatchObject({
      status: 200,
      message: 'Success',
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      role: 2,
    });
    expect(typeof res.body.token).toBe('string');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('accepte aussi le JSON et l\'alias /login.php', async () => {
    const res = await request(app.getHttpServer())
      .post('/login.php')
      .send({ email: 'julie@example.com', password: 'adminpass' })
      .expect(200);

    expect(res.body.role).toBe(1);
  });

  it('mauvais mot de passe : { status: 400, message: "Error" }', async () => {
    const res = await login({ email: 'jean@example.com', password: 'mauvais' }).expect(400);
    expect(res.body).toEqual({ status: 400, message: 'Error' });
  });

  it('email inconnu : même erreur', async () => {
    const res = await login({ email: 'inconnu@example.com', password: 'userpass' }).expect(400);
    expect(res.body).toEqual({ status: 400, message: 'Error' });
  });

  it('entrées invalides : même erreur', async () => {
    const res = await login({ email: 'pas-un-email', password: '' }).expect(400);
    expect(res.body).toEqual({ status: 400, message: 'Error' });
  });

  it('JSON mal formé : même erreur', async () => {
    const res = await request(app.getHttpServer())
      .post('/login')
      .set('Content-Type', 'application/json')
      .send('{bad')
      .expect(400);
    expect(res.body).toEqual({ status: 400, message: 'Error' });
  });

  it('GET /login : 405, il faut utiliser POST', async () => {
    const res = await request(app.getHttpServer()).get('/login').expect(405);
    expect(res.body.status).toBe(405);
  });

  it('GET /me : profil avec un token valide, 401 sinon', async () => {
    const { body } = await login({ email: 'julie@example.com', password: 'adminpass' });

    const ok = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${body.token}`)
      .expect(200);
    expect(ok.body.firstName).toBe('Julie');

    const ko = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', 'Bearer faux')
      .expect(401);
    expect(ko.body).toEqual({ status: 401, message: 'Unauthorized' });
  });

  it('route inconnue : 404', async () => {
    const res = await request(app.getHttpServer()).get('/nimporte').expect(404);
    expect(res.body).toEqual({ status: 404, message: 'Not found' });
  });
});
