const { body, param } = require('express-validator');
const validar = require('../middlewares/validate');

const criarValidator = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome da categoria é obrigatório.')
    .isLength({ max: 100 }).withMessage('O nome deve ter no máximo 100 caracteres.'),
  body('descricao')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('A descrição deve ter no máximo 255 caracteres.'),
  validar,
];

const atualizarValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('O nome da categoria é obrigatório.')
    .isLength({ max: 100 }).withMessage('O nome deve ter no máximo 100 caracteres.'),
  body('descricao')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('A descrição deve ter no máximo 255 caracteres.'),
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
