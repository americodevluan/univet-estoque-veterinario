// Testes do CRUD de categorias
const request = require('supertest');
const app = require('../src/app');
const { loginAdmin, loginFuncionario, autenticar } = require('./helpers');

describe('Categorias', () => {
  test('listar categorias retorna array', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/categorias').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('criar categoria retorna 201', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/categorias')
      .set(autenticar(token))
      .send({ nome: 'Categoria Teste' });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Categoria Teste');
  });

  test('criar categoria sem nome retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app).post('/api/categorias').set(autenticar(token)).send({ nome: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('criar categoria duplicada retorna 409', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/categorias')
      .set(autenticar(token))
      .send({ nome: 'Analgésicos' });
    expect(res.status).toBe(409);
  });

  test('editar categoria retorna 200 com dados atualizados', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .put('/api/categorias/1')
      .set(autenticar(token))
      .send({ nome: 'Anti-inflamatórios (editado)' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Anti-inflamatórios (editado)');
  });

  test('inativar categoria (soft delete) retorna ativo=false', async () => {
    const token = await loginAdmin();
    const res = await request(app).delete('/api/categorias/2').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.ativo).toBe(false);
  });

  test('buscar categoria inexistente retorna 404', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/categorias/99999').set(autenticar(token));
    expect(res.status).toBe(404);
  });

  test('FUNCIONARIO não pode criar categoria (403)', async () => {
    const token = await loginFuncionario();
    const res = await request(app)
      .post('/api/categorias')
      .set(autenticar(token))
      .send({ nome: 'Proibida' });
    expect(res.status).toBe(403);
  });
});
