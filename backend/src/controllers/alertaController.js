const alertaService = require('../services/alertaService');
const asyncHandler = require('../utils/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const alertas = await alertaService.obterAlertas();
  res.json(alertas);
});
