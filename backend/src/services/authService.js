const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Autenticação: confere e-mail/senha e emite o token JWT
async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Mensagem genérica: não revela se o e-mail existe
  if (!usuario || !usuario.ativo) {
    throw new ApiError(401, 'E-mail ou senha inválidos.');
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaCorreta) {
    throw new ApiError(401, 'E-mail ou senha inválidos.');
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
  };
}

// Retorna os dados do usuário autenticado
async function me(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, email: true, perfil: true, ativo: true, createdAt: true },
  });
  if (!usuario || !usuario.ativo) throw new ApiError(401, 'Usuário não encontrado ou inativo.');
  return usuario;
}

module.exports = { login, me };
