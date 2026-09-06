import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState, Paginacao, formatarDataHora } from '../components/ui';

export default function EntradasPage() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [page, setPage] = useState(1);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Formulário rápido de nova entrada
  const [form, setForm] = useState({ produtoId: '', quantidade: '', lote: '', dataValidade: '', valorCompra: '', fornecedorId: '', observacao: '' });
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = () => {
    api.get('/entradas', { params: { page, limit: 10 } }).then((r) => setDados(r.data)).catch((err) => setErro(extrairErro(err)));
  };

  useEffect(() => {
    carregar();
  }, [page]);

  useEffect(() => {
    Promise.all([api.get('/produtos', { params: { status: 'ativos', limit: 100 } }), api.get('/fornecedores')])
      .then(([p, f]) => {
        setProdutos(p.data.data);
        setFornecedores(f.data);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.produtoId || !form.quantidade || Number(form.quantidade) < 1) {
      setErroForm('Selecione o produto e informe uma quantidade maior que zero.');
      return;
    }
    setEnviando(true);
    setErroForm('');
    try {
      await api.post('/entradas', {
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
        lote: form.lote || null,
        dataValidade: form.dataValidade || null,
        valorCompra: form.valorCompra === '' ? undefined : Number(form.valorCompra),
        fornecedorId: form.fornecedorId || null,
        observacao: form.observacao || null,
      });
      setForm({ produtoId: '', quantidade: '', lote: '', dataValidade: '', valorCompra: '', fornecedorId: '', observacao: '' });
      setSucesso('Entrada registrada! O estoque do produto foi atualizado.');
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
          <h1 className="page-title h3 mb-0">Entradas de Estoque</h1>
          <span className="text-muted">Registrar entrada de medicamentos e produtos</span>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/movimentacoes')}>
          <i className="bi bi-arrow-left-right me-1"></i>Ver histórico
        </button>
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}
      {sucesso && <div className="alert alert-success py-2 small">{sucesso}</div>}

      {/* Formulário */}
      <div className="card p-3 mb-4">
        <h2 className="h6 fw-bold mb-3">Nova entrada</h2>
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
              <label className="form-label">Lote</label>
              <input className="form-control" value={form.lote} onChange={(e) => setForm((f) => ({ ...f, lote: e.target.value }))} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Validade</label>
              <input type="date" className="form-control" value={form.dataValidade} onChange={(e) => setForm((f) => ({ ...f, dataValidade: e.target.value }))} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Valor compra</label>
              <input type="number" step="0.01" min="0" className="form-control" value={form.valorCompra} onChange={(e) => setForm((f) => ({ ...f, valorCompra: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Fornecedor</label>
              <select className="form-select" value={form.fornecedorId} onChange={(e) => setForm((f) => ({ ...f, fornecedorId: e.target.value }))}>
                <option value="">—</option>
                {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div className="col-12 d-flex gap-2 align-items-end">
              <input className="form-control" placeholder="Observação (opcional)" value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} />
              <button type="submit" className="btn btn-success text-nowrap" disabled={enviando}>
                <i className="bi bi-box-arrow-in-down me-1"></i>{enviando ? 'Registrando...' : 'Registrar entrada'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Histórico de entradas */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th className="text-center">Quantidade</th>
                <th>Lote</th>
                <th>Validade</th>
                <th className="text-end">Valor compra</th>
                <th>Fornecedor</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {!dados && <tr><td colSpan={8}><Loading /></td></tr>}
              {dados?.data.length === 0 && <tr><td colSpan={8}><EmptyState /></td></tr>}
              {dados?.data.map((e) => (
                <tr key={e.id}>
                  <td className="small">{formatarDataHora(e.dataEntrada)}</td>
                  <td className="fw-semibold">{e.produto.nome}</td>
                  <td className="text-center"><span className="badge badge-normal">+{e.quantidade}</span></td>
                  <td className="small">{e.lote ?? '—'}</td>
                  <td className="small">{e.dataValidade ? new Date(e.dataValidade).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="text-end">{Number(e.valorCompra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="small">{e.fornecedor?.nome ?? '—'}</td>
                  <td className="small">{e.usuario.nome}</td>
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
