const { Router } = require('express');
const controller = require('../controllers/alertaController');

const router = Router();

router.get('/', controller.listar);

module.exports = router;
