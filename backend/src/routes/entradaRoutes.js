const { Router } = require('express');
const controller = require('../controllers/entradaController');
const { criarValidator, listarValidator, idValidator } = require('../validators/entradaValidator');

const router = Router();

router.get('/', listarValidator, controller.listar);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', criarValidator, controller.registrar);

module.exports = router;
