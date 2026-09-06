const { body, param, query } = require('express-validator');
const validar = require('../middlewares/validate');

const MOTIVOS = ['VENDA', 'USO_CLINICO', 'AVARIA', 'VENCIMENTO', 'PERDA', 'OUTROS'];

const criarValidator = [
  body('produtoId')
    .notEmpty().withMessage('O produto é obrigatório.')
    .isInt({ min: 1 }).withMessage('Produto inválido.'),
  body('quantidade')
    .notEmpty().withMessage('A quantidade é obrigatória.')
    .isInt({ min: 1 }).withMessage('A quantidade deve ser maior que zero.'),
  body('motivo')
    .notEmpty().withMessage('O motivo é obrigatório.')
    .isIn(MOTIVOS).withMessage(`Motivo inválido. Use: ${MOTIVOS.join(', ')}.`),
  body('clienteTutor')
    .optional({ nullable: true })
    .isLength({ max: 150 }).withMessage('O nome do cliente/tutor deve ter no máximo 150 caracteres.'),
  body('observacao')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('A observação deve ter no máximo 255 caracteres.'),
  body('usuarioId')
    .optional()
    .isInt({ min: 1 }).withMessage('Usuário inválido.'),
  validar,
];

const listarValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite inválido.'),
  query('produtoId').optional().isInt({ min: 1 }).withMessage('Filtro de produto inválido.'),
  query('motivo')
    .optional()
    .isIn(MOTIVOS).withMessage('Filtro de motivo inválido.'),
  query('dataInicio').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('dataFim').optional().isISO8601().withMessage('Data final inválida.'),
  validar,
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  validar,
];

module.exports = { criarValidator, listarValidator, idValidator };
