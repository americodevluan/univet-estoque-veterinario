const ApiError = require('../utils/ApiError');

// Middleware de permissão: restringe a rota a determinados perfis
// Ex.: authorize('ADMIN') ou authorize('ADMIN', 'FUNCIONARIO')
module.exports = (...perfis) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Não autenticado.'));
  }
  if (!perfis.includes(req.user.perfil)) {
    return next(new ApiError(403, 'Sem permissão para realizar esta ação.'));
  }
  return next();
};
