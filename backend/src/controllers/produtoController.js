const produtoService = require('../services/produtoService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const resultado = await produtoService.listar(req.query);
  res.json(resultado);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const produto = await produtoService.buscarPorId(req.params.id);
  res.json(produto);
});

exports.criar = asyncHandler(async (req, res) => {
  const produto = await produtoService.criar(req.body);
  res.status(201).json(produto);
});

exports.atualizar = asyncHandler(async (req, res) => {
  const produto = await produtoService.atualizar(req.params.id, req.body);
  res.json(produto);
});

exports.inativar = asyncHandler(async (req, res) => {
  const produto = await produtoService.inativar(req.params.id);
  res.json(produto);
});
