const { Router } = require('express');
const controller = require('../controllers/dashboardController');

const router = Router();

router.get('/', controller.obter);

module.exports = router;
