const { Router } = require('express');
const controller = require('../controllers/produtoController');
const { criarValidator, atualizarValidator, listarValidator, idValidator } = require('../validators/produtoValidator');

const router = Router();

router.get('/', listarValidator, controller.listar);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', criarValidator, controller.criar);
router.put('/:id', atualizarValidator, controller.atualizar);
router.delete('/:id', idValidator, controller.inativar);

module.exports = router;
