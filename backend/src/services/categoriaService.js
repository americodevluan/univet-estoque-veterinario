const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

// Lista apenas categorias ativas (com contagem de produtos)
async function listar() {
  return prisma.categoria.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
    include: { _count: { select: { produtos: true } } },
  });
}

// Lista todas as categorias, inclusive inativas (uso administrativo)
async function listarTodas() {
  return prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { produtos: true } } },
  });
}

async function buscarPorId(id) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { produtos: true } } },
  });
  if (!categoria) throw new ApiError(404, 'Categoria não encontrada.');
  return categoria;
}

async function criar(dados) {
  return prisma.categoria.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao ?? null,
    },
  });
}

async function atualizar(id, dados) {
  await buscarPorId(id);
  return prisma.categoria.update({
    where: { id: Number(id) },
    data: {
      nome: dados.nome,
      descricao: dados.descricao ?? null,
      ativo: dados.ativo,
    },
  });
}

// Inativação (soft delete) — a categoria continua existindo no histórico
async function inativar(id) {
  await buscarPorId(id);
  return prisma.categoria.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
}

module.exports = { listar, listarTodas, buscarPorId, criar, atualizar, inativar };
