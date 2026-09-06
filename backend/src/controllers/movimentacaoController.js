const movimentacaoService = require('../services/movimentacaoService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const resultado = await movimentacaoService.listarMovimentacoes(req.query);
  res.json(resultado);
});
