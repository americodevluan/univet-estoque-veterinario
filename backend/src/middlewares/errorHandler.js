const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

// Middleware global de tratamento de erros
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // Erros conhecidos do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'Já existe um registro com os mesmos dados exclusivos.',
        campo: Array.isArray(err.meta?.target) ? err.meta.target : undefined,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Registro não encontrado.' });
    }
    return res.status(500).json({ message: 'Erro ao acessar o banco de dados.' });
  }

  // Erros de negócio
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Erro de JSON inválido no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Corpo da requisição inválido.' });
  }

  console.error('[ERRO]', err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
};
