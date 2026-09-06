const fornecedorService = require('../services/fornecedorService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const fornecedores = await fornecedorService.listar();
  res.json(fornecedores);
});

exports.listarTodos = asyncHandler(async (req, res) => {
  const fornecedores = await fornecedorService.listarTodos();
  res.json(fornecedores);
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const fornecedor = await fornecedorService.buscarPorId(req.params.id);
  res.json(fornecedor);
});

exports.criar = asyncHandler(async (req, res) => {
  const fornecedor = await fornecedorService.criar(req.body);
  res.status(201).json(fornecedor);
});

exports.atualizar = asyncHandler(async (req, res) => {
  const fornecedor = await fornecedorService.atualizar(req.params.id, req.body);
  res.json(fornecedor);
});

exports.inativar = asyncHandler(async (req, res) => {
  const fornecedor = await fornecedorService.inativar(req.params.id);
  res.json(fornecedor);
});
