const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { situacaoValidade } = require('../utils/validade');

// Motivos que permitem baixa de produtos vencidos
const MOTIVOS_BAIXA_VENCIDO = ['VENCIMENTO', 'PERDA', 'AVARIA', 'OUTROS'];

// Registra uma saída e atualiza o estoque em transação:
// quantidadeAtual = quantidadeAtual - quantidade (nunca negativo)
async function registrar(dados) {
  const produto = await prisma.produto.findUnique({ where: { id: Number(dados.produtoId) } });
  if (!produto) throw new ApiError(404, 'Produto não encontrado.');
  if (!produto.ativo) throw new ApiError(400, 'Produto inativo não pode ter saídas.');

  const quantidade = Number(dados.quantidade);

  // Regra: nunca permitir estoque negativo
  if (quantidade > produto.quantidadeAtual) {
    throw new ApiError(
      400,
      `Estoque insuficiente. Disponível: ${produto.quantidadeAtual} ${produto.unidadeMedida ?? 'un'}.`
    );
  }

  // Regra: produto vencido não pode ser vendido nem usado em atendimento
  const validade = situacaoValidade(produto.dataValidade);
  if (validade?.situacao === 'VENCIDO' && !MOTIVOS_BAIXA_VENCIDO.includes(dados.motivo)) {
    throw new ApiError(
      400,
      'Produto vencido não pode ser movimentado para venda ou uso clínico. Utilize o motivo VENCIMENTO ou PERDA para baixa.'
    );
  }

  return prisma.$transaction(async (tx) => {
    const saida = await tx.saida.create({
      data: {
        produtoId: Number(dados.produtoId),
        quantidade,
        motivo: dados.motivo,
        clienteTutor: dados.clienteTutor ?? null,
        observacao: dados.observacao ?? null,
        usuarioId: Number(dados.usuarioId),
      },
      include: { produto: { select: { id: true, nome: true, quantidadeAtual: true } } },
    });

    const produtoAtualizado = await tx.produto.update({
      where: { id: Number(dados.produtoId) },
      data: { quantidadeAtual: { decrement: quantidade } },
    });

    return { ...saida, novoEstoque: produtoAtualizado.quantidadeAtual };
  });
}

// Lista saídas com filtros e paginação
async function listar(filtros = {}) {
  const { produtoId, motivo, dataInicio, dataFim, page = 1, limit = 10 } = filtros;

  const where = {};
  if (produtoId) where.produtoId = Number(produtoId);
  if (motivo) where.motivo = motivo;
  if (dataInicio || dataFim) {
    where.dataSaida = {};
    if (dataInicio) where.dataSaida.gte = new Date(dataInicio);
    if (dataFim) where.dataSaida.lte = new Date(dataFim);
  }

  const total = await prisma.saida.count({ where });
  const pagina = Number(page);
  const porPagina = Number(limit);

  const data = await prisma.saida.findMany({
    where,
    include: {
      produto: { select: { id: true, nome: true, codigo: true } },
      usuario: { select: { id: true, nome: true } },
    },
    orderBy: { dataSaida: 'desc' },
    skip: (pagina - 1) * porPagina,
    take: porPagina,
  });

  return {
    data,
    meta: { total, page: pagina, limit: porPagina, totalPages: Math.ceil(total / porPagina) },
  };
}

async function buscarPorId(id) {
  const saida = await prisma.saida.findUnique({
    where: { id: Number(id) },
    include: {
      produto: { select: { id: true, nome: true, codigo: true } },
      usuario: { select: { id: true, nome: true } },
    },
  });
  if (!saida) throw new ApiError(404, 'Saída não encontrada.');
  return saida;
}

module.exports = { registrar, listar, buscarPorId };
