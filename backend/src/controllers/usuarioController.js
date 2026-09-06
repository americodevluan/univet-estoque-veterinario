const usuarioService = require('../services/usuarioService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listar();
  res.json(usuarios);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.buscarPorId(req.params.id);
  res.json(usuario);
});

exports.criar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.criar(req.body);
  res.status(201).json(usuario);
});

exports.atualizar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.atualizar(req.params.id, req.body);
  res.json(usuario);
});

exports.inativar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.inativar(req.params.id);
  res.json(usuario);
});
