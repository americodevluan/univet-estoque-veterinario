const saidaService = require('../services/saidaService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const resultado = await saidaService.listar(req.query);
  res.json(resultado);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const saida = await saidaService.buscarPorId(req.params.id);
  res.json(saida);
});

exports.registrar = asyncHandler(async (req, res) => {
  // O usuário autenticado (JWT) é registrado como responsável pela movimentação
  const usuarioId = req.user?.id ?? req.body.usuarioId;
  const saida = await saidaService.registrar({ ...req.body, usuarioId });
  res.status(201).json(saida);
});
