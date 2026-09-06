const { Router } = require('express');
const controller = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { criarValidator, atualizarValidator, idValidator } = require('../validators/usuarioValidator');

const router = Router();

// Apenas ADMIN gerencia usuários
router.use(auth, authorize('ADMIN'));

router.get('/', controller.listar);
router.get('/:id', idValidator, controller.buscarPorId);
router.post('/', criarValidator, controller.criar);
router.put('/:id', atualizarValidator, controller.atualizar);
router.delete('/:id', idValidator, controller.inativar);

module.exports = router;
