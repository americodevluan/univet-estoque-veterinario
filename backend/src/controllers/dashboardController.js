const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

exports.obter = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.obterDashboard();
  res.json(dashboard);
});
