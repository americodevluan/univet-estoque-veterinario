const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

async function listar() {
  return prisma.fornecedor.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
    include: { _count: { select: { produtos: true } } },
  });
}

async function listarTodos() {
  return prisma.fornecedor.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { produtos: true } } },
  });
}

async function buscarPorId(id) {
  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id: Number(id) },
    include: {
      produtos: {
        where: { ativo: true },
        select: { id: true, nome: true, codigo: true, quantidadeAtual: true, unidadeMedida: true },
        orderBy: { nome: 'asc' },
      },
      _count: { select: { produtos: true } },
    },
  });
  if (!fornecedor) throw new ApiError(404, 'Fornecedor não encontrado.');
  return fornecedor;
}

async function criar(dados) {
  return prisma.fornecedor.create({
    data: {
      nome: dados.nome,
      cnpj: dados.cnpj ?? null,
      telefone: dados.telefone ?? null,
      email: dados.email ?? null,
      endereco: dados.endereco ?? null,
      cidade: dados.cidade ?? null,
      estado: dados.estado ?? null,
      cep: dados.cep ?? null,
    },
  });
}

async function atualizar(id, dados) {
  await buscarPorId(id);
  const { nome, cnpj, telefone, email, endereco, cidade, estado, cep, ativo } = dados;
  return prisma.fornecedor.update({
    where: { id: Number(id) },
    data: {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      cep,
      ativo,
    },
  });
}

// Inativação (soft delete) — o fornecedor continua no histórico
async function inativar(id) {
  await buscarPorId(id);
  return prisma.fornecedor.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
}

module.exports = { listar, listarTodos, buscarPorId, criar, atualizar, inativar };
