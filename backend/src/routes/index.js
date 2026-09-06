const { Router } = require('express');

const router = Router();

// Os módulos de rotas serão montados aqui conforme forem criados:
router.use('/categorias', require('./categoriaRoutes'));
router.use('/fornecedores', require('./fornecedorRoutes'));
router.use('/produtos', require('./produtoRoutes'));
router.use('/entradas', require('./entradaRoutes'));

module.exports = router;
