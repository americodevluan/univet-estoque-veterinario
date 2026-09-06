const { query } = require('express-validator');
const validar = require('../middlewares/validate');

const listarValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite inválido.'),
  query('produtoId').optional().isInt({ min: 1 }).withMessage('Filtro de produto inválido.'),
  query('usuarioId').optional().isInt({ min: 1 }).withMessage('Filtro de usuário inválido.'),
  query('tipo')
    .optional()
    .isIn(['ENTRADA', 'SAIDA']).withMessage('Filtro de tipo inválido.'),
  query('motivo')
    .optional()
    .isIn(['VENDA', 'USO_CLINICO', 'AVARIA', 'VENCIMENTO', 'PERDA', 'OUTROS'])
    .withMessage('Filtro de motivo inválido.'),
  query('dataInicio').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('dataFim').optional().isISO8601().withMessage('Data final inválida.'),
  validar,
];

module.exports = { listarValidator };
