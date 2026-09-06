const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

exports.login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.json(resultado);
});

exports.me = asyncHandler(async (req, res) => {
  const usuario = await authService.me(req.user.id);
  res.json(usuario);
});
