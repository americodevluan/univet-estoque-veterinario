import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ConfiguracoesPage() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/alertas'), api.get('/dashboard')])
      .then(([a, d]) => setDados({ alertas: a.data.totais, dashboard: d.data }))
      .catch(() => setDados({ alertas: null, dashboard: null }));
  }, []);

  return (
    <div>
      <h1 className="page-title h3 mb-4">Configurações</h1>

      <div className="card p-4 mb-3">
        <h2 className="h6 fw-bold mb-2">Sobre o sistema</h2>
        <p className="text-muted small mb-0">
          <strong>UniVet</strong> — Controle de estoque da Clínica Veterinária Fernanda Calixto.
          Projeto Integrador (PI) desenvolvido com React, Node.js, Express, Prisma e PostgreSQL.
          API REST documentada em <code>/api</code> para futura integração com o sistema principal da clínica.
        </p>
      </div>

      <div className="card p-4 mb-3">
        <h2 className="h6 fw-bold mb-2">Regras de negócio</h2>
        <ul className="small mb-0 text-muted">
          <li>Entrada de estoque sempre aumenta a quantidade; saída sempre diminui.</li>
          <li>Não é permitida saída maior que o estoque disponível (estoque nunca negativo).</li>
          <li>Produtos vencidos não podem ser vendidos ou usados em atendimento (apenas baixa).</li>
          <li>Estoque baixo: quantidade atual ≤ quantidade mínima.</li>
          <li>Vencimento próximo: validade nos próximos 30 dias; vencido: validade já expirada.</li>
          <li>Toda movimentação gera histórico e registra o usuário responsável.</li>
          <li>Registros com histórico não são excluídos fisicamente — apenas inativados.</li>
        </ul>
      </div>

      <div className="card p-4">
        <h2 className="h6 fw-bold mb-2">Indicadores atuais</h2>
        {!dados && <p className="text-muted small mb-0">Carregando...</p>}
        {dados?.alertas && (
          <ul className="small mb-0 text-muted">
            <li>Produtos em estoque baixo: {dados.alertas.estoqueBaixo}</li>
            <li>Produtos vencidos: {dados.alertas.vencidos}</li>
            <li>Produtos vencendo em 30 dias: {dados.alertas.vencendo30d}</li>
            <li>Valor estimado do estoque: R$ {Number(dados.dashboard?.valorEstimadoEstoque ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
          </ul>
        )}
      </div>
    </div>
  );
}
