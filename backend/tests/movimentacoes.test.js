// Testes de movimentações: entradas, saídas, cálculo de estoque e regras de negócio
const request = require('supertest');
const app = require('../src/app');
const { loginAdmin, autenticar } = require('./helpers');

async function estoqueAtual(produtoId, token) {
  const res = await request(app).get(`/api/produtos/${produtoId}`).set(autenticar(token));
  return res.body.quantidadeAtual;
}

describe('Entradas', () => {
  test('entrada aumenta o estoque (soma)', async () => {
    const token = await loginAdmin();
    const antes = await estoqueAtual(3, token);
    const res = await request(app)
      .post('/api/entradas')
      .set(autenticar(token))
      .send({ produtoId: 3, quantidade: 7, observacao: 'Teste de entrada' });
    expect(res.status).toBe(201);
    expect(res.body.novoEstoque).toBe(antes + 7);
    expect(await estoqueAtual(3, token)).toBe(antes + 7);
  });

  test('entrada com quantidade zero retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/entradas')
      .set(autenticar(token))
      .send({ produtoId: 3, quantidade: 0 });
    expect(res.status).toBe(400);
  });

  test('entrada de produto inexistente retorna 404', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/entradas')
      .set(autenticar(token))
      .send({ produtoId: 99999, quantidade: 5 });
    expect(res.status).toBe(404);
  });

  test('entrada gera registro no histórico', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/entradas')
      .set(autenticar(token))
      .send({ produtoId: 5, quantidade: 3 });
    expect(res.status).toBe(201);

    const historico = await request(app)
      .get('/api/movimentacoes?tipo=ENTRADA&produtoId=5')
      .set(autenticar(token));
    expect(historico.status).toBe(200);
    const encontrada = historico.body.data.find((m) => m.id === res.body.id);
    expect(encontrada).toBeDefined();
    expect(encontrada.tipo).toBe('ENTRADA');
  });
});

describe('Saídas', () => {
  test('saída diminui o estoque (subtração)', async () => {
    const token = await loginAdmin();
    const antes = await estoqueAtual(5, token);
    const res = await request(app)
      .post('/api/saidas')
      .set(autenticar(token))
      .send({ produtoId: 5, quantidade: 2, motivo: 'VENDA', clienteTutor: 'Tutor Teste' });
    expect(res.status).toBe(201);
    expect(res.body.novoEstoque).toBe(antes - 2);
    expect(await estoqueAtual(5, token)).toBe(antes - 2);
  });

  test('saída maior que o estoque retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/saidas')
      .set(autenticar(token))
      .send({ produtoId: 3, quantidade: 999999, motivo: 'VENDA' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Estoque insuficiente');
  });

  test('saída de produto vencido para venda retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/saidas')
      .set(autenticar(token))
      .send({ produtoId: 4, quantidade: 1, motivo: 'VENDA' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('vencido');
  });

  test('baixa de produto vencido com motivo VENCIMENTO é permitida', async () => {
    const token = await loginAdmin();
    const antes = await estoqueAtual(4, token);
    const res = await request(app)
      .post('/api/saidas')
      .set(autenticar(token))
      .send({ produtoId: 4, quantidade: 1, motivo: 'VENCIMENTO', observacao: 'Teste de baixa' });
    expect(res.status).toBe(201);
    expect(res.body.novoEstoque).toBe(antes - 1);
  });

  test('saída com motivo inválido retorna 400', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/api/saidas')
      .set(autenticar(token))
      .send({ produtoId: 5, quantidade: 1, motivo: 'MOTIVO_INVALIDO' });
    expect(res.status).toBe(400);
  });
});

describe('Histórico e alertas', () => {
  test('histórico unificado lista entradas e saídas', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/movimentacoes?limit=50').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThan(0);
    const tipos = new Set(res.body.data.map((m) => m.tipo));
    expect(tipos.has('ENTRADA')).toBe(true);
    expect(tipos.has('SAIDA')).toBe(true);
  });

  test('endpoint de alertas retorna estoque baixo, vencidos e vencendo', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/alertas').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.totais.estoqueBaixo).toBeGreaterThan(0);
    expect(res.body.totais.vencidos).toBeGreaterThan(0);
    expect(res.body.totais.vencendo30d).toBeGreaterThan(0);
  });

  test('dashboard retorna indicadores e gráficos', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/api/dashboard').set(autenticar(token));
    expect(res.status).toBe(200);
    expect(res.body.totalProdutos).toBeGreaterThan(0);
    expect(res.body.estoqueBaixo).toBeGreaterThan(0);
    expect(res.body.graficos.movimentacoesMensais.length).toBe(6);
  });
});
