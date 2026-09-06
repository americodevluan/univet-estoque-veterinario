const { query } = require('express-validator');
const validar = require('../middlewares/validate');

const listarValidator = [
  query('formato')
    .optional()
    .isIn(['csv', 'json']).withMessage('Formato inválido. Use csv ou json.'),
  query('dataInicio').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('dataFim').optional().isISO8601().withMessage('Data final inválida.'),
  validar,
];

module.exports = { listarValidator };
