// Configura as variáveis de ambiente para o banco de testes
// (executado pelo Jest antes de cada suíte)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.test') });
