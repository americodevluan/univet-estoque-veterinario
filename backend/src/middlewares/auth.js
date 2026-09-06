const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Middleware de autenticação: valida o token JWT e injeta o usuário em req.user
module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Não autenticado. Informe o token de acesso.'));
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    req.user = { id: payload.id, nome: payload.nome, email: payload.email, perfil: payload.perfil };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Token inválido ou expirado.'));
  }
};
