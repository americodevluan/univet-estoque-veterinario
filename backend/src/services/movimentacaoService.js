const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

const MOTIVOS_SAIDA = {
  VENDA: 'Venda',
  USO_CLINICO: 'Uso clínico',
  AVARIA: 'Avaria',
  VENCIMENTO: 'Vencimento',
  PERDA: 'Perda',
  OUTROS: 'Outros',
};

// Histórico unificado de movimentações (entradas + saídas)
// com filtros por período, produto, tipo, usuário e motivo
async function listarMovimentacoes(filtros = {}) {
  const {
    produtoId,
    usuarioId,
    tipo,
    motivo,
    dataInicio,
    dataFim,
    page = 1,
    limit = 10,
  } = filtros;

  const whereEntrada = { oculto: false };
  const whereSaida = { oculto: false };

  if (produtoId) {
    whereEntrada.produtoId = Number(produtoId);
    whereSaida.produtoId = Number(produtoId);
  }
  if (usuarioId) {
    whereEntrada.usuarioId = Number(usuarioId);
    whereSaida.usuarioId = Number(usuarioId);
  }
  if (dataInicio || dataFim) {
    whereEntrada.dataEntrada = {};
    whereSaida.dataSaida = {};
    if (dataInicio) {
      whereEntrada.dataEntrada.gte = new Date(dataInicio);
      whereSaida.dataSaida.gte = new Date(dataInicio);
    }
    if (dataFim) {
      whereEntrada.dataEntrada.lte = new Date(dataFim);
      whereSaida.dataSaida.lte = new Date(dataFim);
    }
  }
  if (motivo) whereSaida.motivo = motivo;

  const [entradas, saidas] = await Promise.all([
    tipo !== 'SAIDA'
      ? prisma.entrada.findMany({
          where: whereEntrada,
          include: {
            produto: { select: { id: true, nome: true, codigo: true } },
            usuario: { select: { id: true, nome: true } },
            fornecedor: { select: { id: true, nome: true } },
          },
        })
      : [],
    tipo !== 'ENTRADA'
      ? prisma.saida.findMany({
          where: whereSaida,
          include: {
            produto: { select: { id: true, nome: true, codigo: true } },
            usuario: { select: { id: true, nome: true } },
          },
        })
      : [],
  ]);

  const movimentacoes = [
    ...entradas.map((e) => ({
      id: e.id,
      chave: `E${e.id}`,
      data: e.dataEntrada,
      tipo: 'ENTRADA',
      quantidade: e.quantidade,
      produtoId: e.produtoId,
      produto: e.produto.nome,
      codigo: e.produto.codigo,
      usuario: e.usuario.nome,
      motivo: null,
      motivoLabel: '—',
      clienteTutor: null,
      lote: e.lote,
      dataValidade: e.dataValidade,
      fornecedor: e.fornecedor?.nome ?? null,
      observacao: e.observacao,
    })),
    ...saidas.map((s) => ({
      id: s.id,
      chave: `S${s.id}`,
      data: s.dataSaida,
      tipo: 'SAIDA',
      quantidade: s.quantidade,
      produtoId: s.produtoId,
      produto: s.produto.nome,
      codigo: s.produto.codigo,
      usuario: s.usuario.nome,
      motivo: s.motivo,
      motivoLabel: MOTIVOS_SAIDA[s.motivo] ?? s.motivo,
      clienteTutor: s.clienteTutor,
      lote: null,
      dataValidade: null,
      fornecedor: null,
      observacao: s.observacao,
    })),
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  const total = movimentacoes.length;
  const pagina = Number(page);
  const porPagina = Number(limit);

  return {
    data: movimentacoes.slice((pagina - 1) * porPagina, (pagina - 1) * porPagina + porPagina),
    meta: { total, page: pagina, limit: porPagina, totalPages: Math.ceil(total / porPagina) },
  };
}

// Oculta (soft delete) uma movimentação: some das listagens, mas o registro
// permanece no banco para preservar o histórico e a integridade do estoque.
async function ocultarMovimentacao({ tipo, id }) {
  const registroId = Number(id);

  if (tipo === 'ENTRADA') {
    const entrada = await prisma.entrada.update({
      where: { id: registroId },
      data: { oculto: true },
    });
    return { id: entrada.id, tipo: 'ENTRADA', oculto: true };
  }

  if (tipo === 'SAIDA') {
    const saida = await prisma.saida.update({
      where: { id: registroId },
      data: { oculto: true },
    });
    return { id: saida.id, tipo: 'SAIDA', oculto: true };
  }

  throw new ApiError(400, 'Tipo de movimentação inválido. Use ENTRADA ou SAIDA.');
}

module.exports = { listarMovimentacoes, ocultarMovimentacao, MOTIVOS_SAIDA };
