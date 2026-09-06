import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { Loading, formatarMoeda, formatarData } from '../components/ui';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CARD_STYLES = {
  total: { icon: 'bi-box-seam', bg: '#e6f5f0', cor: '#0f9d7a', label: 'Total de Produtos' },
  ativos: { icon: 'bi-check-circle', bg: '#e8f4fd', cor: '#0ea5e9', label: 'Produtos Ativos' },
  baixo: { icon: 'bi-exclamation-triangle', bg: '#fef3e2', cor: '#b45309', label: 'Estoque Baixo' },
  vencidos: { icon: 'bi-x-circle', bg: '#fdecee', cor: '#dc3545', label: 'Vencidos' },
  vencendo: { icon: 'bi-clock-history', bg: '#fff7e0', cor: '#ca8a04', label: 'Vencendo 30d' },
  entradasMes: { icon: 'bi-box-arrow-in-down', bg: '#e7f6ec', cor: '#16a34a', label: 'Entradas do Mês' },
  saidasMes: { icon: 'bi-box-arrow-up', bg: '#fef3e2', cor: '#ea580c', label: 'Saídas do Mês' },
  valor: { icon: 'bi-cash-stack', bg: '#f3e8ff', cor: '#7c3aed', label: 'Valor do Estoque' },
};

function StatCard({ tipo, valor }) {
  const s = CARD_STYLES[tipo];
  return (
    <div className="card vet-stat-card p-3 h-100">
      <div className="d-flex align-items-center gap-3">
        <div className="vet-stat-icon" style={{ background: s.bg, color: s.cor }}>
          <i className={`bi ${s.icon}`}></i>
        </div>
        <div>
          <div className="vet-stat-value">{valor}</div>
          <div className="vet-stat-label">{s.label}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dados, setDados] = useState(null);
  const [alertas, setAlertas] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/alertas')])
      .then(([d, a]) => {
        setDados(d.data);
        setAlertas(a.data);
      })
      .catch((err) => setErro(err?.response?.data?.message || 'Erro ao carregar o dashboard.'));
  }, []);

  if (erro) return <div className="alert alert-danger">{erro}</div>;
  if (!dados || !alertas) return <Loading />;

  const meses = dados.graficos.movimentacoesMensais;
  const cat = dados.graficos.produtosPorCategoria;

  const graficoBarras = {
    labels: meses.map((m) => m.rotulo),
    datasets: [
      { label: 'Entradas', data: meses.map((m) => m.entradas), backgroundColor: '#0f9d7a', borderRadius: 6 },
      { label: 'Saídas', data: meses.map((m) => m.saidas), backgroundColor: '#f59e0b', borderRadius: 6 },
    ],
  };

  const graficoCategoria = {
    labels: cat.map((c) => c.categoria),
    datasets: [
      {
        data: cat.map((c) => c.total),
        backgroundColor: ['#0f9d7a', '#0ea5e9', '#f59e0b', '#7c3aed', '#ef4444', '#14b8a6', '#f97316', '#64748b'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="page-title h3 mb-0">Dashboard</h1>
          <span className="text-muted">Visão geral do estoque da clínica</span>
        </div>
        <Link to="/produtos" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Novo Produto
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard tipo="total" valor={dados.totalProdutos} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="ativos" valor={dados.produtosAtivos} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="baixo" valor={dados.estoqueBaixo} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="vencidos" valor={dados.vencidos} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="vencendo" valor={dados.vencendo30d} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="entradasMes" valor={dados.entradasMes} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="saidasMes" valor={dados.saidasMes} /></div>
        <div className="col-6 col-md-3"><StatCard tipo="valor" valor={formatarMoeda(dados.valorEstimadoEstoque)} /></div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card p-3 h-100">
            <h2 className="h6 fw-bold mb-3">Entradas × Saídas (últimos 6 meses)</h2>
            <Bar
              data={graficoBarras}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card p-3 h-100">
            <h2 className="h6 fw-bold mb-3">Produtos por categoria</h2>
            <Doughnut
              data={graficoCategoria}
              options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }}
            />
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h2 className="h6 fw-bold mb-3">
              <i className="bi bi-exclamation-triangle text-warning me-1"></i>Estoque baixo
            </h2>
            {alertas.estoqueBaixo.length === 0 && <p className="text-muted small mb-0">Nenhum produto abaixo do mínimo.</p>}
            <ul className="list-group list-group-flush">
              {alertas.estoqueBaixo.slice(0, 6).map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                  <span>{p.nome}</span>
                  <span className="badge badge-baixo">{p.quantidadeAtual} / mín {p.quantidadeMinima}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card p-3 h-100">
            <h2 className="h6 fw-bold mb-3">
              <i className="bi bi-clock-history text-danger me-1"></i>Validade: vencidos e vencendo
            </h2>
            {alertas.vencidos.length === 0 && alertas.vencendo.length === 0 && (
              <p className="text-muted small mb-0">Nenhum produto com alerta de validade.</p>
            )}
            <ul className="list-group list-group-flush">
              {alertas.vencidos.slice(0, 3).map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                  <span>{p.nome}</span>
                  <span className="badge badge-vencido">Vencido em {formatarData(p.dataValidade)}</span>
                </li>
              ))}
              {alertas.vencendo.slice(0, 3).map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                  <span>{p.nome}</span>
                  <span className="badge badge-vencendo">Vence em {p.diasParaVencimento}d</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
