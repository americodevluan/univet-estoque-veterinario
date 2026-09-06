const { body, param } = require('express-validator');
const validar = require('../middlewares/validate');

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;

const criarValidator = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome do fornecedor é obrigatório.')
    .isLength({ max: 150 }).withMessage('O nome deve ter no máximo 150 caracteres.'),
  body('cnpj')
    .optional({ nullable: true })
    .matches(CNPJ_REGEX).withMessage('CNPJ inválido. Use o formato 00.000.000/0000-00.'),
  body('telefone')
    .optional({ nullable: true })
    .isLength({ max: 20 }).withMessage('Telefone inválido.'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('E-mail inválido.')
    .isLength({ max: 150 }).withMessage('O e-mail deve ter no máximo 150 caracteres.'),
  body('endereco').optional({ nullable: true }).isLength({ max: 255 }).withMessage('Endereço muito longo.'),
  body('cidade').optional({ nullable: true }).isLength({ max: 100 }).withMessage('Cidade muito longa.'),
  body('estado')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 letras (UF).'),
  body('cep')
    .optional({ nullable: true })
    .matches(CEP_REGEX).withMessage('CEP inválido. Use o formato 00000-000.'),
  validar,
];

const atualizarValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('O nome do fornecedor é obrigatório.'),
  body('cnpj')
    .optional({ nullable: true })
    .matches(CNPJ_REGEX).withMessage('CNPJ inválido. Use o formato 00.000.000/0000-00.'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('E-mail inválido.'),
  body('estado')
    .optional({ nullable: true })
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 letras (UF).'),
  body('cep')
    .optional({ nullable: true })
    .matches(CEP_REGEX).withMessage('CEP inválido. Use o formato 00000-000.'),
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
