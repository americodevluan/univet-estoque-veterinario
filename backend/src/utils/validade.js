// Constantes e funções de apoio para validade de produtos
const DIAS_ALERTA_VENCIMENTO = 30;

// Retorna a situação de validade de um produto:
// null (sem validade), VENCIDO, VENCENDO (até 30 dias) ou VALIDO
function situacaoValidade(dataValidade, referencia = new Date()) {
  if (!dataValidade) return null;
  const fim = new Date(dataValidade);
  fim.setHours(23, 59, 59, 999);
  const dias = Math.ceil((fim.getTime() - referencia.getTime()) / 86400000);

  if (dias < 0) return { situacao: 'VENCIDO', dias };
  if (dias <= DIAS_ALERTA_VENCIMENTO) return { situacao: 'VENCENDO', dias };
  return { situacao: 'VALIDO', dias };
}

// Data final do período de alerta (hoje + 30 dias)
function limiteVencimento(referencia = new Date()) {
  const fim = new Date(referencia);
  fim.setDate(fim.getDate() + DIAS_ALERTA_VENCIMENTO);
  return fim;
}

module.exports = { DIAS_ALERTA_VENCIMENTO, situacaoValidade, limiteVencimento };
