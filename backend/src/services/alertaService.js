const prisma = require('../config/database');
const { situacaoValidade } = require('../utils/validade');

// Monta a visão completa de um produto (com alertas calculados)
function comAlertas(produto) {
  const validade = situacaoValidade(produto.dataValidade);
  return {
    id: produto.id,
    nome: produto.nome,
    codigo: produto.codigo,
    categoria: produto.categoria?.nome ?? null,
    fornecedor: produto.fornecedor?.nome ?? null,
    unidadeMedida: produto.unidadeMedida,
    quantidadeAtual: produto.quantidadeAtual,
    quantidadeMinima: produto.quantidadeMinima,
    dataValidade: produto.dataValidade,
    lote: produto.lote,
    alertaEstoqueBaixo: produto.quantidadeAtual <= produto.quantidadeMinima,
    situacaoValidade: validade ? validade.situacao : null,
    diasParaVencimento: validade ? validade.dias : null,
  };
}

// Lista os alertas: estoque baixo, produtos vencidos e vencendo em até 30 dias
async function obterAlertas() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    include: {
      categoria: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
    orderBy: { nome: 'asc' },
  });

  const estoqueBaixo = [];
  const vencidos = [];
  const vencendo = [];

  for (const p of produtos) {
    const visao = comAlertas(p);
    if (p.quantidadeAtual <= p.quantidadeMinima) estoqueBaixo.push(visao);
    if (visao.situacaoValidade === 'VENCIDO') vencidos.push(visao);
    else if (visao.situacaoValidade === 'VENCENDO') vencendo.push(visao);
  }

  estoqueBaixo.sort((a, b) => a.quantidadeAtual - b.quantidadeAtual);
  vencidos.sort((a, b) => a.diasParaVencimento - b.diasParaVencimento);
  vencendo.sort((a, b) => a.diasParaVencimento - b.diasParaVencimento);

  return {
    estoqueBaixo,
    vencidos,
    vencendo,
    totais: {
      estoqueBaixo: estoqueBaixo.length,
      vencidos: vencidos.length,
      vencendo30d: vencendo.length,
    },
  };
}

module.exports = { obterAlertas, comAlertas };
