import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState, Paginacao, formatarDataHora } from '../components/ui';

const MOTIVOS = [
  ['VENDA', 'Venda'],
  ['USO_CLINICO', 'Uso clínico'],
  ['AVARIA', 'Avaria'],
  ['VENCIMENTO', 'Vencimento'],
  ['PERDA', 'Perda'],
  ['OUTROS', 'Outros'],
];

export default function SaidasPage() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [page, setPage] = useState(1);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [form, setForm] = useState({ produtoId: '', quantidade: '', motivo: 'VENDA', clienteTutor: '', observacao: '' });
  const [produtos, setProdutos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = () => {
    api.get('/saidas', { params: { page, limit: 10 } }).then((r) => setDados(r.data)).catch((err) => setErro(extrairErro(err)));
  };

  useEffect(() => {
    carregar();
  }, [page]);

  useEffect(() => {
    api.get('/produtos', { params: { status: 'ativos', limit: 100 } })
      .then((r) => setProdutos(r.data.data.filter((p) => p.quantidadeAtual > 0)))
      .catch(() => {});
  }, [dados]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.produtoId || !form.quantidade || Number(form.quantidade) < 1) {
      setErroForm('Selecione o produto e informe uma quantidade maior que zero.');
      return;
    }
    setEnviando(true);
    setErroForm('');
    try {
      await api.post('/saidas', {
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
        motivo: form.motivo,
        clienteTutor: form.clienteTutor || null,
        observacao: form.observacao || null,
      });
      setForm({ produtoId: '', quantidade: '', motivo: 'VENDA', clienteTutor: '', observacao: '' });
      setSucesso('Saída registrada! O estoque do produto foi atualizado.');
      carregar();
      setTimeout(() => setSucesso(''), 5000);
    } catch (err) {
      setErroForm(extrairErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title h3 mb-0">Saídas de Estoque</h1>
          <span className="text-muted">Registrar saída de medicamentos e produtos</span>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/movimentacoes')}>
          <i className="bi bi-arrow-left-right me-1"></i>Ver histórico
        </button>
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}
      {sucesso && <div className="alert alert-success py-2 small">{sucesso}</div>}

      <div className="card p-3 mb-4">
        <h2 className="h6 fw-bold mb-3">Nova saída</h2>
        {erroForm && <div className="alert alert-danger py-2 small">{erroForm}</div>}
        <form onSubmit={onSubmit}>
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label">Produto *</label>
              <select className="form-select" value={form.produtoId} onChange={(e) => setForm((f) => ({ ...f, produtoId: e.target.value }))}>
                <option value="">Selecione...</option>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.quantidadeAtual} em estoque)</option>)}
              </select>
            </div>
            <div className="col-4 col-md-1">
              <label className="form-label">Qtd *</label>
              <input type="number" min="1" className="form-control" value={form.quantidade} onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))} />
            </div>
            <div className="col-8 col-md-2">
              <label className="form-label">Motivo *</label>
              <select className="form-select" value={form.motivo} onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}>
                {MOTIVOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Cliente / Tutor</label>
              <input className="form-control" value={form.clienteTutor} onChange={(e) => setForm((f) => ({ ...f, clienteTutor: e.target.value }))} />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-warning w-100 text-nowrap" disabled={enviando}>
                <i className="bi bi-box-arrow-up me-1"></i>{enviando ? 'Registrando...' : 'Registrar saída'}
              </button>
            </div>
            <div className="col-12">
              <input className="form-control" placeholder="Observação (opcional)" value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} />
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th className="text-center">Quantidade</th>
                <th>Motivo</th>
                <th>Cliente / Tutor</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {!dados && <tr><td colSpan={6}><Loading /></td></tr>}
              {dados?.data.length === 0 && <tr><td colSpan={6}><EmptyState /></td></tr>}
              {dados?.data.map((s) => (
                <tr key={s.id}>
                  <td className="small">{formatarDataHora(s.dataSaida)}</td>
                  <td className="fw-semibold">{s.produto.nome}</td>
                  <td className="text-center"><span className="badge badge-vencendo">-{s.quantidade}</span></td>
                  <td>{MOTIVOS.find(([v]) => v === s.motivo)?.[1] ?? s.motivo}</td>
                  <td className="small">{s.clienteTutor ?? '—'}</td>
                  <td className="small">{s.usuario.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3"><Paginacao meta={dados?.meta} onChange={setPage} /></div>
      </div>
    </div>
  );
}
