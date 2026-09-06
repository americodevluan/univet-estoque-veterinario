const relatorioService = require('../services/relatorioService');
const { gerarCSV } = require('../utils/csv');
const asyncHandler = require('../utils/asyncHandler');

// Envia o resultado como JSON ou como download CSV (formato=csv)
function responder(res, nomeArquivo, dados, colunas, linhas) {
  if (res.locals.formato === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}.csv"`);
    return res.send(gerarCSV(colunas, linhas));
  }
  return res.json(dados);
}

exports.estoque = asyncHandler(async (req, res) => {
  const dados = await relatorioService.relatorioEstoque();
  res.locals.formato = req.query.formato;
  responder(res, 'relatorio-estoque', dados, ['Código', 'Produto', 'Categoria', 'Fornecedor', 'Unidade', 'Quantidade', 'Mínimo', 'Valor Compra', 'Valor Venda', 'Lote', 'Validade', 'Situação Validade', 'Estoque Baixo'], dados.map((p) => [
    p.codigo, p.nome, p.categoria, p.fornecedor, p.unidadeMedida, p.quantidadeAtual, p.quantidadeMinima,
    p.valorCompra, p.valorVenda, p.lote, p.dataValidade ? p.dataValidade.toISOString().slice(0, 10) : '',
    p.situacaoValidade, p.alertaEstoqueBaixo ? 'SIM' : 'NÃO',
  ]));
});

exports.estoqueBaixo = asyncHandler(async (req, res) => {
  const dados = await relatorioService.relatorioEstoqueBaixo();
  res.locals.formato = req.query.formato;
  responder(res, 'relatorio-estoque-baixo', dados, ['Código', 'Produto', 'Categoria', 'Quantidade', 'Mínimo', 'Situação Validade'], dados.map((p) => [
    p.codigo, p.nome, p.categoria, p.quantidadeAtual, p.quantidadeMinima, p.situacaoValidade,
  ]));
});

exports.validade = asyncHandler(async (req, res) => {
  const dados = await relatorioService.relatorioValidade();
  res.locals.formato = req.query.formato;
  const linhas = [
    ...dados.vencidos.map((p) => [p.codigo, p.nome, p.dataValidade.toISOString().slice(0, 10), 'VENCIDO']),
    ...dados.vencendo30d.map((p) => [p.codigo, p.nome, p.dataValidade.toISOString().slice(0, 10), 'VENCENDO 30 DIAS']),
    ...dados.validos.map((p) => [p.codigo, p.nome, p.dataValidade ? p.dataValidade.toISOString().slice(0, 10) : '—', p.situacaoValidade ?? 'SEM VALIDADE']),
  ];
  responder(res, 'relatorio-validade', dados, ['Código', 'Produto', 'Validade', 'Situação'], linhas);
});

exports.movimentacoes = asyncHandler(async (req, res) => {
  const dados = await relatorioService.relatorioMovimentacoes(req.query);
  res.locals.formato = req.query.formato;
  responder(res, 'relatorio-movimentacoes', dados, ['Data', 'Tipo', 'Produto', 'Código', 'Quantidade', 'Usuário', 'Motivo', 'Detalhe', 'Observação'], dados.map((m) => [
    m.data.toISOString().slice(0, 16).replace('T', ' '), m.tipo, m.produto, m.codigo, m.quantidade, m.usuario, m.motivo, m.detalhe ?? '', m.observacao ?? '',
  ]));
});
