const { Router } = require('express');
const controller = require('../controllers/produtoController');
const authorize = require('../middlewares/authorize');
const { criarValidator, atualizarValidator, listarValidator, idValidator } = require('../validators/produtoValidator');

const router = Router();

router.get('/', listarValidator, controller.listar);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', authorize('ADMIN'), criarValidator, controller.criar);
router.put('/:id', authorize('ADMIN'), atualizarValidator, controller.atualizar);
router.delete('/:id', authorize('ADMIN'), idValidator, controller.inativar);

module.exports = router;
