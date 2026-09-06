const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

// Registra uma entrada e atualiza o estoque em transação:
// quantidadeAtual = quantidadeAtual + quantidade
async function registrar(dados) {
  const produto = await prisma.produto.findUnique({ where: { id: Number(dados.produtoId) } });
  if (!produto) throw new ApiError(404, 'Produto não encontrado.');
  if (!produto.ativo) throw new ApiError(400, 'Produto inativo não pode receber entradas.');

  return prisma.$transaction(async (tx) => {
    const entrada = await tx.entrada.create({
      data: {
        produtoId: Number(dados.produtoId),
        quantidade: Number(dados.quantidade),
        lote: dados.lote ?? null,
        dataValidade: dados.dataValidade ? new Date(dados.dataValidade) : null,
        valorCompra: dados.valorCompra ?? 0,
        fornecedorId: dados.fornecedorId ? Number(dados.fornecedorId) : null,
        observacao: dados.observacao ?? null,
        usuarioId: Number(dados.usuarioId),
      },
      include: { produto: { select: { id: true, nome: true, quantidadeAtual: true } } },
    });

    // Atualiza o estoque e o lote/validade atuais do produto
    const produtoAtualizado = await tx.produto.update({
      where: { id: Number(dados.produtoId) },
      data: {
        quantidadeAtual: { increment: Number(dados.quantidade) },
        ...(dados.lote ? { lote: dados.lote } : {}),
        ...(dados.dataValidade ? { dataValidade: new Date(dados.dataValidade) } : {}),
        ...(dados.valorCompra !== undefined && dados.valorCompra !== null
          ? { valorCompra: Number(dados.valorCompra) }
          : {}),
      },
    });

    return { ...entrada, novoEstoque: produtoAtualizado.quantidadeAtual };
  });
}

// Lista entradas com filtros e paginação
async function listar(filtros = {}) {
  const { produtoId, dataInicio, dataFim, page = 1, limit = 10 } = filtros;

  const where = {};
  if (produtoId) where.produtoId = Number(produtoId);
  if (dataInicio || dataFim) {
    where.dataEntrada = {};
    if (dataInicio) where.dataEntrada.gte = new Date(dataInicio);
    if (dataFim) where.dataEntrada.lte = new Date(dataFim);
  }

  const total = await prisma.entrada.count({ where });
  const pagina = Number(page);
  const porPagina = Number(limit);

  const data = await prisma.entrada.findMany({
    where,
    include: {
      produto: { select: { id: true, nome: true, codigo: true } },
      usuario: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
    orderBy: { dataEntrada: 'desc' },
    skip: (pagina - 1) * porPagina,
    take: porPagina,
  });

  return {
    data,
    meta: { total, page: pagina, limit: porPagina, totalPages: Math.ceil(total / porPagina) },
  };
}

async function buscarPorId(id) {
  const entrada = await prisma.entrada.findUnique({
    where: { id: Number(id) },
    include: {
      produto: { select: { id: true, nome: true, codigo: true } },
      usuario: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
    },
  });
  if (!entrada) throw new ApiError(404, 'Entrada não encontrada.');
  return entrada;
}

module.exports = { registrar, listar, buscarPorId };
