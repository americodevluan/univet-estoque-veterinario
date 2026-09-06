// Prepara o banco de testes: aplica migrations e popula o seed
const path = require('path');
const { execSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

module.exports = async () => {
  const node = process.execPath;
  const prismaCli = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');

  console.log('[testes] Aplicando migrations no banco de testes...');
  execSync(`"${node}" "${prismaCli}" migrate deploy`, { stdio: 'inherit' });

  console.log('[testes] Populando seed...');
  execSync(`"${node}" "${path.join(__dirname, '..', 'prisma', 'seed.js')}"`, { stdio: 'inherit' });
};
