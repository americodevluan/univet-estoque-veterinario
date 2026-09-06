const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

// Campos seguros para retorno (nunca expor a senha)
const CAMPOS_SEGUROS = {
  select: { id: true, nome: true, email: true, perfil: true, ativo: true, createdAt: true, updatedAt: true },
};

async function listar() {
  return prisma.usuario.findMany({
    ...CAMPOS_SEGUROS,
    orderBy: { nome: 'asc' },
  });
}

async function buscarPorId(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) }, ...CAMPOS_SEGUROS });
  if (!usuario) throw new ApiError(404, 'Usuário não encontrado.');
  return usuario;
}

async function criar(dados) {
  const senhaHash = await bcrypt.hash(dados.senha, 10);
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      perfil: dados.perfil,
    },
    ...CAMPOS_SEGUROS,
  });
}

async function atualizar(id, dados) {
  await buscarPorId(id);
  const data = {};
  if (dados.nome !== undefined) data.nome = dados.nome;
  if (dados.email !== undefined) data.email = dados.email;
  if (dados.perfil !== undefined) data.perfil = dados.perfil;
  if (dados.ativo !== undefined) data.ativo = dados.ativo;
  if (dados.senha) data.senhaHash = await bcrypt.hash(dados.senha, 10);

  return prisma.usuario.update({ where: { id: Number(id) }, data, ...CAMPOS_SEGUROS });
}

async function inativar(id) {
  await buscarPorId(id);
  return prisma.usuario.update({
    where: { id: Number(id) },
    data: { ativo: false },
    ...CAMPOS_SEGUROS,
  });
}

module.exports = { listar, buscarPorId, criar, atualizar, inativar };
