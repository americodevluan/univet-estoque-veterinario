const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`API de Estoque Veterinário rodando em http://localhost:${env.port}`);
});
