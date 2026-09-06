const entradaService = require('../services/entradaService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const resultado = await entradaService.listar(req.query);
  res.json(resultado);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const entrada = await entradaService.buscarPorId(req.params.id);
  res.json(entrada);
});

exports.registrar = asyncHandler(async (req, res) => {
  // O usuário autenticado (JWT) é registrado como responsável pela movimentação
  const usuarioId = req.user?.id ?? req.body.usuarioId;
  const entrada = await entradaService.registrar({ ...req.body, usuarioId });
  res.status(201).json(entrada);
});
