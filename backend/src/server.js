const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const app = require('./app');
const env = require('./config/env');

const prisma = new PrismaClient();

// Em produção, popula dados de demonstração apenas se o banco estiver vazio.
async function seedSeNecessario() {
  if (process.env.SEED_ON_START !== 'true') {
    console.log('[seed] SEED_ON_START desabilitado — nenhum seed automático.');
    return;
  }
  const total = await prisma.produto.count();
  if (total > 0) {
    console.log(`[seed] Banco já possui ${total} produto(s); seed ignorado.`);
    return;
  }
  console.log('[seed] Banco vazio — populando dados de demonstração...');
  execSync(`node ${path.join(__dirname, '..', 'prisma', 'seed.js')}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}

seedSeNecessario()
  .catch((err) => {
    console.error('Falha ao preparar o banco:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    app.listen(env.port, () => {
      console.log(`API de Estoque Veterinário rodando em http://localhost:${env.port}`);
    });
  });
