// scripts/hash-password.ts
// Génère le hachage bcrypt d'un mot de passe, à copier dans src/users/data/users.json.
// Usage : npm run hash -- "monMotDePasse"

import * as bcrypt from 'bcryptjs';

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage : npm run hash -- "monMotDePasse"');
    process.exit(1);
  }

  console.log(await bcrypt.hash(password, 12));
}

void main();
