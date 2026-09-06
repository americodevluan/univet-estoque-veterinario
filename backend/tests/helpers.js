// Utilitários compartilhados pelos testes
const request = require('supertest');
const app = require('../src/app');

async function login(email, senha) {
  const res = await request(app).post('/api/auth/login').send({ email, senha });
  return res.body.token;
}

const loginAdmin = () => login('admin@clinica.com', 'admin123');
const loginFuncionario = () => login('funcionario@clinica.com', 'func123');
const autenticar = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { loginAdmin, loginFuncionario, autenticar };
