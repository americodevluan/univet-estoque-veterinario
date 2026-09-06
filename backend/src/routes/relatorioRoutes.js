const { Router } = require('express');
const controller = require('../controllers/relatorioController');
const { listarValidator } = require('../validators/relatorioValidator');

const router = Router();

router.get('/estoque', listarValidator, controller.estoque);
router.get('/estoque-baixo', listarValidator, controller.estoqueBaixo);
router.get('/validade', listarValidator, controller.validade);
router.get('/movimentacoes', listarValidator, controller.movimentacoes);

module.exports = router;
