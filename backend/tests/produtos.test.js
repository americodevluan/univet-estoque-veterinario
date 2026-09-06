// Testes do CRUD de produtos, filtros e alertas calculados
const request = require('supertest');
const app = require('../src/app');
const { loginAdmin, autenticar } = require('./helpers');

const CODIGO = `PRO-TEST-${Date.now()}`;

describe('Produtos', () => {
  test('cadastrar produto válido retorna 201', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({
        nome: 'Produto de Teste',
        codigo: CODIGO,
        categoriaId: 1,
        fornecedorId: 1,
        descricao: 'Produto criado nos testes',
        unidadeMedida: 'un',
        quantidadeAtual: 10,
        quantidadeMinima: 3,
        valorCompra: 5,
        valorVenda: 12,
      });
    expect(res.status).toBe(201);
    expect(res.body.quantidadeAtual).toBe(10);
    expect(res.body.codigo).toBe(CODIGO);
  });

  test('cadastro sem categoria retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Sem Categoria', codigo: 'PRO-X2' });
    expect(res.status).toBe(400);
  });

  test('cadastro com quantidade negativa retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Negativo', codigo: 'PRO-X3', categoriaId: 1, quantidadeAtual: -5 });
    expect(res.status).toBe(400);
  });

  test('cadastro com código duplicado retorna 409', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Duplicado', codigo: 'PRO-001', categoriaId: 1 });
    expect(res.status).toBe(409);
  });

  test('listar produtos retorna paginação', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/produtos?page=1&limit=5').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBeGreaterThan(0);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  test('editar produto altera os dados cadastrais', async () => {
    const token = await loginAdmin();
    const criado = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Produto Editável', codigo: `PRO-EDIT-${Date.now()}`, categoriaId: 1 });
    const res = await request(app)
      .put(`/api/produtos/${criado.body.id}`)
      .set(autenticar(token))
      .send({ nome: 'Produto Editado', valorVenda: 25.5 });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Produto Editado');
  });

  test('edição via PUT não altera a quantidade em estoque', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .put('/api/produtos/1')
      .set(autenticar(token))
      .send({ quantidadeAtual: 999, valorVenda: 10 });
    expect(res.status).toBe(200);
    expect(res.body.quantidadeAtual).not.toBe(999);
  });

  test('filtro de validade "vencido" retorna apenas produtos vencidos', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/produtos?validade=vencido').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const p of res.body.data) {
      expect(p.situacaoValidade).toBe('VENCIDO');
    }
  });

  test('alerta de estoque baixo é calculado (quantidadeAtual <= mínima)', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/produtos?search=Dipirona+Veterin%C3%A1ria').set(autenticar(token));
    const dipirona = res.body.data.find((p) => p.nome === 'Dipirona Veterinária');
    expect(dipirona).toBeDefined();
    expect(dipirona.alertaEstoqueBaixo).toBe(true);
  });

  test('alerta de validade é calculado (vencendo em até 30 dias)', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/produtos?search=Amoxicilina').set(autenticar(token));
    const amox = res.body.data.find((p) => p.nome === 'Amoxicilina');
    expect(amox).toBeDefined();
    expect(amox.situacaoValidade).toBe('VENCENDO');
    expect(amox.diasParaVencimento).toBeLessThanOrEqual(30);
  });

  test('inativar produto (soft delete) retorna ativo=false', async () => {
    const token = await loginAdmin();
    const criado = await request(app)
      .post('/api/produtos')
      .set(autenticar(token))
      .send({ nome: 'Produto Inativável', codigo: `PRO-INA-${Date.now()}`, categoriaId: 1 });
    const res = await request(app).delete(`/api/produtos/${criado.body.id}`).set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.ativo).toBe(false);
  });

  test('produto inativo não aparece na listagem padrão', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/produtos?status=ativos').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.ativo === true)).toBe(true);
  });
});
