# Login App Plus

Application Flutter de connexion qui s'authentifie via une API REST au lieu d'un tableau local.

Le projet contient :
- l'**application Flutter** (dossier `lib/`) ;
- l'**API** dans le dossier `api/`, faite en **NestJS** avec une base **SQLite**. Les mots de passe sont hachés avec bcrypt.

## Identifiants de test

| Email             | Mot de passe |
|-------------------|--------------|
| jean@example.com  | userpass     |
| julie@example.com | adminpass    |

## Lancer l'API

```bash
cd api
npm install
cp .env.example .env
npm run build
npm start
```

L'API tourne sur `http://localhost:3000`. La base SQLite et les comptes de test sont créés automatiquement au premier lancement.

Endpoint de connexion : `POST /login` avec `email` et `password`.

- Succès : `{ "status": 200, "message": "Success", "id": 1, "firstName": "Jean", ... }`
- Erreur : `{ "status": 400, "message": "Error" }`

## Lancer l'application

```bash
flutter pub get
flutter run
```

Sur l'émulateur Android, l'app appelle `http://10.0.2.2:3000`. Ailleurs, elle appelle `http://localhost:3000`.
Pour une autre adresse : `flutter run --dart-define=API_URL=https://mon-api.com`

## Tests

```bash
flutter test
cd api && npm test
```

## Captures d'écran

| Connexion | Chargement | Erreur | Profil |
|-----------|------------|--------|--------|
| ![](docs/login.png) | ![](docs/loading.png) | ![](docs/error.png) | ![](docs/profile.png) |
