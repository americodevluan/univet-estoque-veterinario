const { Router } = require('express');
const controller = require('../controllers/fornecedorController');
const authorize = require('../middlewares/authorize');
const { criarValidator, atualizarValidator, idValidator } = require('../validators/fornecedorValidator');

const router = Router();

router.get('/', controller.listar);
router.get('/todos', controller.listarTodos);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', authorize('ADMIN'), criarValidator, controller.criar);
router.put('/:id', authorize('ADMIN'), atualizarValidator, controller.atualizar);
router.delete('/:id', authorize('ADMIN'), idValidator, controller.inativar);

module.exports = router;
