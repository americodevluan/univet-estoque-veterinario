const { Router } = require('express');
const controller = require('../controllers/authController');
const { loginValidator } = require('../validators/authValidator');
const auth = require('../middlewares/auth');

const router = Router();

router.post('/login', loginValidator, controller.login);
router.get('/me', auth, controller.me);

module.exports = router;
