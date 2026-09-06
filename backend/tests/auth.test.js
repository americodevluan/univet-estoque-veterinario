// Testes de autenticação e permissões
const request = require('supertest');
const app = require('../src/app');
const { loginAdmin, loginFuncionario, autenticar } = require('./helpers');

describe('Autenticação', () => {
  test('login com credenciais válidas retorna token e usuário', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@clinica.com',
      senha: 'admin123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe('admin@clinica.com');
    expect(res.body.usuario.perfil).toBe('ADMIN');
  });

  test('login com senha incorreta retorna 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@clinica.com',
      senha: 'senha-errada',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  test('login com e-mail inexistente retorna 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nao-existe@clinica.com',
      senha: 'qualquer',
    });
    expect(res.status).toBe(401);
  });

  test('rota protegida sem token retorna 401', async () => {
    const res = await request(app).get('/api/produtos');
    expect(res.status).toBe(401);
  });

  test('rota protegida com token inválido retorna 401', async () => {
    const res = await request(app).get('/api/produtos').set(autenticar('token-invalido'));
    expect(res.status).toBe(401);
  });

  test('GET /auth/me retorna o usuário autenticado', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/auth/me').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@clinica.com');
  });
});

describe('Permissões', () => {
  test('FUNCIONARIO não pode criar produto (403)', async () => {
    const token = await loginFuncionario();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Produto Proibido', codigo: 'PRO-X', categoriaId: 1 });
    expect(res.status).toBe(403);
  });

  test('ADMIN pode criar produto (201)', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Produto Permitido', codigo: 'PRO-OK-1', categoriaId: 1 });
    expect(res.status).toBe(201);
  });

  test('FUNCIONARIO não pode listar usuários (403)', async () => {
    const token = await loginFuncionario();
    const res = await request(app).get('/api/usuarios').set(autenticar(token));
    expect(res.status).toBe(403);
  });

  test('ADMIN pode listar usuários (200)', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/usuarios').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('FUNCIONARIO pode registrar entrada (201)', async () => {
    const token = await loginFuncionario();
    const res = await request(app)
      .post('/api/entradas')
      .set(autenticar(token))
      .send({ produtoId: 1, quantidade: 1 });
    expect(res.status).toBe(201);
  });
});
