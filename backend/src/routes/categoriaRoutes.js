const { Router } = require('express');
const controller = require('../controllers/categoriaController');
const { criarValidator, atualizarValidator, idValidator } = require('../validators/categoriaValidator');

const router = Router();

router.get('/', controller.listar);
router.get('/todas', controller.listarTodas);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', criarValidator, controller.criar);
router.put('/:id', atualizarValidator, controller.atualizar);
router.delete('/:id', idValidator, controller.inativar);

module.exports = router;
