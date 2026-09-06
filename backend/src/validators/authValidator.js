const { body } = require('express-validator');
const validar = require('../middlewares/validate');

const loginValidator = [
  body('email')
    .notEmpty().withMessage('O e-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.'),
  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.'),
  validar,
];

module.exports = { loginValidator };
