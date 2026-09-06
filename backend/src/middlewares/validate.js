const { validationResult } = require('express-validator');

// Aplica os erros de validação (express-validator) como resposta 400
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors: errors.array().map((e) => ({ campo: e.path, mensagem: e.msg })),
    });
  }
  next();
};
