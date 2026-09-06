const { body, param, query } = require('express-validator');
const validar = require('../middlewares/validate');

const criarValidator = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome do produto é obrigatório.')
    .isLength({ max: 150 }).withMessage('O nome deve ter no máximo 150 caracteres.'),
  body('codigo')
    .trim()
    .notEmpty().withMessage('O código do produto é obrigatório.')
    .isLength({ max: 50 }).withMessage('O código deve ter no máximo 50 caracteres.'),
  body('categoriaId')
    .notEmpty().withMessage('A categoria é obrigatória.')
    .isInt({ min: 1 }).withMessage('Categoria inválida.'),
  body('fornecedorId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Fornecedor inválido.'),
  body('descricao')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('A descrição deve ter no máximo 500 caracteres.'),
  body('unidadeMedida')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 }).withMessage('A unidade de medida deve ter no máximo 20 caracteres.'),
  body('quantidadeAtual')
    .optional()
    .isInt({ min: 0 }).withMessage('A quantidade não pode ser negativa.'),
  body('quantidadeMinima')
    .optional()
    .isInt({ min: 0 }).withMessage('A quantidade mínima não pode ser negativa.'),
  body('valorCompra')
    .optional()
    .isFloat({ min: 0 }).withMessage('O valor de compra não pode ser negativo.'),
  body('valorVenda')
    .optional()
    .isFloat({ min: 0 }).withMessage('O valor de venda não pode ser negativo.'),
  body('lote')
    .optional({ nullable: true })
    .isLength({ max: 50 }).withMessage('O lote deve ter no máximo 50 caracteres.'),
  body('dataValidade')
    .optional({ nullable: true })
    .isISO8601().withMessage('Data de validade inválida.'),
  validar,
];

const atualizarValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  body('nome')
    .optional()
    .trim()
    .notEmpty().withMessage('O nome do produto é obrigatório.'),
  body('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('Categoria inválida.'),
  body('fornecedorId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Fornecedor inválido.'),
  body('quantidadeAtual')
    .optional()
    .isInt({ min: 0 }).withMessage('A quantidade não pode ser negativa.'),
  body('quantidadeMinima')
    .optional()
    .isInt({ min: 0 }).withMessage('A quantidade mínima não pode ser negativa.'),
  body('valorCompra')
    .optional()
    .isFloat({ min: 0 }).withMessage('O valor de compra não pode ser negativo.'),
  body('valorVenda')
    .optional()
    .isFloat({ min: 0 }).withMessage('O valor de venda não pode ser negativo.'),
  body('dataValidade')
    .optional({ nullable: true })
    .isISO8601().withMessage('Data de validade inválida.'),
  body('ativo')
    .optional()
    .isBoolean().withMessage('O campo ativo deve ser booleano.'),
  validar,
];

const listarValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite inválido.'),
  query('categoriaId').optional().isInt({ min: 1 }).withMessage('Filtro de categoria inválido.'),
  query('fornecedorId').optional().isInt({ min: 1 }).withMessage('Filtro de fornecedor inválido.'),
  query('status')
    .optional()
    .isIn(['ativos', 'inativos', 'todos']).withMessage('Filtro de status inválido.'),
  query('validade')
    .optional()
    .isIn(['vencido', 'vencendo', 'valido']).withMessage('Filtro de validade inválido.'),
  validar,
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
  validar,
];

module.exports = { criarValidator, atualizarValidator, listarValidator, idValidator };
