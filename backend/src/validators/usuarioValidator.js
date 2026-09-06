const { body, param } = require('express-validator');
const validar = require('../middlewares/validate');

const criarValidator = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório.')
    .isLength({ max: 150 }).withMessage('O nome deve ter no máximo 150 caracteres.'),
  body('email')
    .notEmpty().withMessage('O e-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.')
    .isLength({ max: 150 }).withMessage('O e-mail deve ter no máximo 150 caracteres.'),
  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('perfil')
    .notEmpty().withMessage('O perfil é obrigatório.')
    .isIn(['ADMIN', 'FUNCIONARIO']).withMessage('Perfil inválido. Use ADMIN ou FUNCIONARIO.'),
  validar,
];

const atualizarValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('O nome é obrigatório.'),
  body('email')
    .optional()
    .isEmail().withMessage('E-mail inválido.'),
  body('senha')
    .optional({ nullable: true })
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('perfil')
    .optional()
    .isIn(['ADMIN', 'FUNCIONARIO']).withMessage('Perfil inválido.'),
  body('ativo')
    .optional()
    .isBoolean().withMessage('O campo ativo deve ser booleano.'),
  validar,
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  validar,
];

module.exports = { criarValidator, atualizarValidator, idValidator };
