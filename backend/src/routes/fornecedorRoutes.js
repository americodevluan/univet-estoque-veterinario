const { Router } = require('express');
const controller = require('../controllers/fornecedorController');
const { criarValidator, atualizarValidator, idValidator } = require('../validators/fornecedorValidator');

const router = Router();

router.get('/', controller.listar);
router.get('/todos', controller.listarTodos);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', criarValidator, controller.criar);
router.put('/:id', atualizarValidator, controller.atualizar);
router.delete('/:id', idValidator, controller.inativar);

module.exports = router;
