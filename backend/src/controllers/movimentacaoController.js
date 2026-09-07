const movimentacaoService = require('../services/movimentacaoService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const resultado = await movimentacaoService.listarMovimentacoes(req.query);
  res.json(resultado);
});

exports.ocultar = asyncHandler(async (req, res) => {
  const resultado = await movimentacaoService.ocultarMovimentacao({
    tipo: req.params.tipo,
    id: req.params.id,
  });
  res.json(resultado);
});
