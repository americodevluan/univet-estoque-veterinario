const { Router } = require('express');
const controller = require('../controllers/movimentacaoController');
const authorize = require('../middlewares/authorize');
const { listarValidator } = require('../validators/movimentacaoValidator');

const router = Router();

router.get('/', listarValidator, controller.listar);

// Ocultar (soft delete) uma movimentação — apenas ADMIN
router.delete('/:tipo/:id', authorize('ADMIN'), controller.ocultar);

module.exports = router;
