const { Router } = require('express');
const auth = require('../middlewares/auth');

const router = Router();

// Rota pública: login (a rota /auth/me protege-se internamente)
router.use('/auth', require('./authRoutes'));

// A partir daqui, todas as rotas exigem autenticação (JWT)
router.use(auth);

router.use('/categorias', require('./categoriaRoutes'));
router.use('/fornecedores', require('./fornecedorRoutes'));
router.use('/produtos', require('./produtoRoutes'));
router.use('/entradas', require('./entradaRoutes'));
router.use('/saidas', require('./saidaRoutes'));
router.use('/movimentacoes', require('./movimentacaoRoutes'));
router.use('/alertas', require('./alertaRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/usuarios', require('./usuarioRoutes'));

module.exports = router;
