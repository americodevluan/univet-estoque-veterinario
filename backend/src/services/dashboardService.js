const prisma = require('../config/database');
const { obterAlertas } = require('./alertaService');
const { limiteVencimento } = require('../utils/validade');

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Agrupa movimentações por mês (últimos 6 meses) para o gráfico Entradas x Saídas
function movimentacoesPorMes(entradas, saidas) {
  const meses = [];
  const hoje = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({ chave: `${d.getFullYear()}-${d.getMonth()}`, rotulo: `${MONTHS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, entradas: 0, saidas: 0 });
  }

  const mapa = new Map(meses.map((m) => [m.chave, m]));
  for (const e of entradas) {
    const chave = `${e.dataEntrada.getFullYear()}-${e.dataEntrada.getMonth()}`;
    if (mapa.has(chave)) mapa.get(chave).entradas += e.quantidade;
  }
  for (const s of saidas) {
    const chave = `${s.dataSaida.getFullYear()}-${s.dataSaida.getMonth()}`;
    if (mapa.has(chave)) mapa.get(chave).saidas += s.quantidade;
  }
  return meses;
}

// Indicadores principais + dados para gráficos do Dashboard
async function obterDashboard() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const limite = limiteVencimento(hoje);

  const [totalProdutos, produtosAtivos, alertas, entradasMes, saidasMes, entradas6m, saidas6m, vencidosTodos] =
    await Promise.all([
      prisma.produto.count(),
      prisma.produto.count({ where: { ativo: true } }),
      obterAlertas(),
      prisma.entrada.aggregate({ _sum: { quantidade: true }, where: { oculto: false, dataEntrada: { gte: inicioMes } } }),
      prisma.saida.aggregate({ _sum: { quantidade: true }, where: { oculto: false, dataSaida: { gte: inicioMes } } }),
      prisma.entrada.findMany({ select: { quantidade: true, dataEntrada: true }, where: { oculto: false } }),
      prisma.saida.findMany({ select: { quantidade: true, dataSaida: true }, where: { oculto: false } }),
      prisma.produto.count({ where: { ativo: true, dataValidade: { lt: hoje } } }),
    ]);

  // Valor estimado do estoque (soma quantidadeAtual * valorCompra) e gráficos por categoria
  const produtosComCategoria = await prisma.produto.findMany({
    where: { ativo: true },
    include: { categoria: { select: { id: true, nome: true } } },
  });

  let valorEstimadoEstoque = 0;
  const porCategoria = new Map();
  for (const p of produtosComCategoria) {
    valorEstimadoEstoque += Number(p.valorCompra) * p.quantidadeAtual;
    const nome = p.categoria?.nome ?? 'Sem categoria';
    if (!porCategoria.has(nome)) porCategoria.set(nome, { total: 0, valor: 0 });
    const item = porCategoria.get(nome);
    item.total += 1;
    item.valor += Number(p.valorCompra) * p.quantidadeAtual;
  }

  const produtosPorCategoria = [...porCategoria.entries()].map(([nome, v]) => ({
    categoria: nome,
    total: v.total,
    valor: Number(v.valor.toFixed(2)),
  }));

  return {
    totalProdutos,
    produtosAtivos,
    estoqueBaixo: alertas.totais.estoqueBaixo,
    vencidos: vencidosTodos,
    vencendo30d: alertas.totais.vencendo30d,
    entradasMes: entradasMes._sum.quantidade ?? 0,
    saidasMes: saidasMes._sum.quantidade ?? 0,
    valorEstimadoEstoque: Number(valorEstimadoEstoque.toFixed(2)),
    graficos: {
      movimentacoesMensais: movimentacoesPorMes(entradas6m, saidas6m),
      produtosPorCategoria,
    },
  };
}

module.exports = { obterDashboard };
