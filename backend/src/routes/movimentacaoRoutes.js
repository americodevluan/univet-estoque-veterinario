const { Router } = require('express');
const controller = require('../controllers/movimentacaoController');
const { listarValidator } = require('../validators/movimentacaoValidator');

const router = Router();

router.get('/', listarValidator, controller.listar);

module.exports = router;
