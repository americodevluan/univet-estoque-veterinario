const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { situacaoValidade, limiteVencimento } = require('../utils/validade');

// Campos calculados para facilitar a exibição e os alertas no frontend
function comSituacao(produto) {
  const validade = situacaoValidade(produto.dataValidade);
  return {
    ...produto,
    alertaEstoqueBaixo: produto.ativo && produto.quantidadeAtual <= produto.quantidadeMinima,
    situacaoValidade: validade ? validade.situacao : null,
    diasParaVencimento: validade ? validade.dias : null,
  };
}

// Lista com pesquisa, filtros e paginação
async function listar(filtros = {}) {
  const {
    search,
    categoriaId,
    fornecedorId,
    status = 'ativos',
    validade,
    page = 1,
    limit = 10,
  } = filtros;

  const where = {};

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { codigo: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (fornecedorId) where.fornecedorId = Number(fornecedorId);

  if (status === 'ativos') where.ativo = true;
  if (status === 'inativos') where.ativo = false;

  const hoje = new Date();
  if (validade === 'vencido') {
    where.dataValidade = { lt: hoje };
  } else if (validade === 'vencendo') {
    where.dataValidade = { gte: hoje, lte: limiteVencimento(hoje) };
  } else if (validade === 'valido') {
    where.dataValidade = { gt: limiteVencimento(hoje) };
  }

  const total = await prisma.produto.count({ where });
  const pagina = Number(page);
  const porPagina = Number(limit);

  const produtos = await prisma.produto.findMany({
    where,
    include: {
      categoria: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
    orderBy: { nome: 'asc' },
    skip: (pagina - 1) * porPagina,
    take: porPagina,
  });

  return {
    data: produtos.map(comSituacao),
    meta: {
      total,
      page: pagina,
      limit: porPagina,
      totalPages: Math.ceil(total / porPagina),
    },
  };
}

async function buscarPorId(id) {
  const produto = await prisma.produto.findUnique({
    where: { id: Number(id) },
    include: {
      categoria: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
      _count: { select: { entradas: true, saidas: true } },
    },
  });
  if (!produto) throw new ApiError(404, 'Produto não encontrado.');
  return comSituacao(produto);
}

async function criar(dados) {
  return prisma.produto.create({
    data: {
      nome: dados.nome,
      codigo: dados.codigo,
      categoriaId: Number(dados.categoriaId),
      fornecedorId: dados.fornecedorId ? Number(dados.fornecedorId) : null,
      descricao: dados.descricao ?? null,
      unidadeMedida: dados.unidadeMedida ?? 'un',
      quantidadeAtual: dados.quantidadeAtual ?? 0,
      quantidadeMinima: dados.quantidadeMinima ?? 0,
      valorCompra: dados.valorCompra ?? 0,
      valorVenda: dados.valorVenda ?? 0,
      lote: dados.lote ?? null,
      dataValidade: dados.dataValidade ? new Date(dados.dataValidade) : null,
    },
  });
}

async function atualizar(id, dados) {
  await buscarPorId(id);
  const dadosLimpos = { ...dados };
  delete dadosLimpos.quantidadeAtual; // estoque só muda via entradas/saídas

  return prisma.produto.update({
    where: { id: Number(id) },
    data: {
      nome: dados.nome,
      codigo: dados.codigo,
      categoriaId: dados.categoriaId ? Number(dados.categoriaId) : undefined,
      fornecedorId: dados.fornecedorId === null || dados.fornecedorId === undefined ? undefined : Number(dados.fornecedorId),
      descricao: dados.descricao,
      unidadeMedida: dados.unidadeMedida,
      quantidadeMinima: dados.quantidadeMinima,
      valorCompra: dados.valorCompra,
      valorVenda: dados.valorVenda,
      lote: dados.lote,
      dataValidade: dados.dataValidade === null || dados.dataValidade === undefined ? undefined : new Date(dados.dataValidade),
      ativo: dados.ativo,
    },
  });
}

// Inativação (soft delete) — o produto não some do histórico
async function inativar(id) {
  await buscarPorId(id);
  return prisma.produto.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
}

module.exports = { listar, buscarPorId, criar, atualizar, inativar };
