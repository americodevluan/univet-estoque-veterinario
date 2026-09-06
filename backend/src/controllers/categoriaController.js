const categoriaService = require('../services/categoriaService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const categorias = await categoriaService.listar();
  res.json(categorias);
});

exports.listarTodas = asyncHandler(async (req, res) => {
  const categorias = await categoriaService.listarTodas();
  res.json(categorias);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.buscarPorId(req.params.id);
  res.json(categoria);
});

exports.criar = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.criar(req.body);
  res.status(201).json(categoria);
});

exports.atualizar = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.atualizar(req.params.id, req.body);
  res.json(categoria);
});

exports.inativar = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.inativar(req.params.id);
  res.json(categoria);
});
