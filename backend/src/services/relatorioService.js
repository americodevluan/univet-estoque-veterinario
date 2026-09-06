const prisma = require('../config/database');
const { situacaoValidade, limiteVencimento } = require('../utils/validade');

// Relatório: situação geral do estoque
async function relatorioEstoque() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    include: {
      categoria: { select: { nome: true } },
      fornecedor: { select: { nome: true } },
    },
    orderBy: { nome: 'asc' },
  });

  return produtos.map((p) => {
    const v = situacaoValidade(p.dataValidade);
    return {
      codigo: p.codigo,
      nome: p.nome,
      categoria: p.categoria?.nome ?? null,
      fornecedor: p.fornecedor?.nome ?? null,
      unidadeMedida: p.unidadeMedida,
      quantidadeAtual: p.quantidadeAtual,
      quantidadeMinima: p.quantidadeMinima,
      valorCompra: Number(p.valorCompra),
      valorVenda: Number(p.valorVenda),
      lote: p.lote,
      dataValidade: p.dataValidade,
      situacaoValidade: v ? v.situacao : null,
      alertaEstoqueBaixo: p.quantidadeAtual <= p.quantidadeMinima,
    };
  });
}

// Relatório: produtos abaixo do estoque mínimo
async function relatorioEstoqueBaixo() {
  const produtos = await relatorioEstoque();
  return produtos.filter((p) => p.alertaEstoqueBaixo);
}

// Relatório: validade (vencidos, vencendo em 30 dias, válidos)
async function relatorioValidade() {
  const produtos = await relatorioEstoque();
  return {
    vencidos: produtos.filter((p) => p.situacaoValidade === 'VENCIDO'),
    vencendo30d: produtos.filter((p) => p.situacaoValidade === 'VENCENDO'),
    validos: produtos.filter((p) => p.situacaoValidade === 'VALIDO' || p.situacaoValidade === null),
  };
}

// Relatório: movimentações em um período
async function relatorioMovimentacoes({ dataInicio, dataFim }) {
  const whereEntrada = {};
  const whereSaida = {};

  if (dataInicio || dataFim) {
    whereEntrada.dataEntrada = {};
    whereSaida.dataSaida = {};
    if (dataInicio) {
      whereEntrada.dataEntrada.gte = new Date(dataInicio);
      whereSaida.dataSaida.gte = new Date(dataInicio);
    }
    if (dataFim) {
      whereEntrada.dataEntrada.lte = new Date(dataFim);
      whereSaida.dataSaida.lte = new Date(dataFim);
    }
  }

  const [entradas, saidas] = await Promise.all([
    prisma.entrada.findMany({
      where: whereEntrada,
      include: {
        produto: { select: { nome: true, codigo: true } },
        usuario: { select: { nome: true } },
        fornecedor: { select: { nome: true } },
      },
      orderBy: { dataEntrada: 'asc' },
    }),
    prisma.saida.findMany({
      where: whereSaida,
      include: {
        produto: { select: { nome: true, codigo: true } },
        usuario: { select: { nome: true } },
      },
      orderBy: { dataSaida: 'asc' },
    }),
  ]);

  const MOTIVOS = {
    VENDA: 'Venda',
    USO_CLINICO: 'Uso clínico',
    AVARIA: 'Avaria',
    VENCIMENTO: 'Vencimento',
    PERDA: 'Perda',
    OUTROS: 'Outros',
  };

  return [
    ...entradas.map((e) => ({
      data: e.dataEntrada,
      tipo: 'ENTRADA',
      produto: e.produto.nome,
      codigo: e.produto.codigo,
      quantidade: e.quantidade,
      usuario: e.usuario.nome,
      motivo: '—',
      detalhe: e.fornecedor?.nome ? `Fornecedor: ${e.fornecedor.nome}` : null,
      observacao: e.observacao,
    })),
    ...saidas.map((s) => ({
      data: s.dataSaida,
      tipo: 'SAIDA',
      produto: s.produto.nome,
      codigo: s.produto.codigo,
      quantidade: s.quantidade,
      usuario: s.usuario.nome,
      motivo: MOTIVOS[s.motivo] ?? s.motivo,
      detalhe: s.clienteTutor ? `Cliente/Tutor: ${s.clienteTutor}` : null,
      observacao: s.observacao,
    })),
  ].sort((a, b) => new Date(a.data) - new Date(b.data));
}

module.exports = { relatorioEstoque, relatorioEstoqueBaixo, relatorioValidade, relatorioMovimentacoes };
