import { useEffect, useState, useCallback } from 'react';
import api, { extrairErro } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Loading, EmptyState, Paginacao, formatarDataHora } from '../components/ui';

const MOTIVOS = [
  ['VENDA', 'Venda'],
  ['USO_CLINICO', 'Uso clínico'],
  ['AVARIA', 'Avaria'],
  ['VENCIMENTO', 'Vencimento'],
  ['PERDA', 'Perda'],
  ['OUTROS', 'Outros'],
];

export default function MovimentacoesPage() {
  const { isAdmin } = useAuth();
  const [dados, setDados] = useState(null);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({ produtoId: '', tipo: '', usuarioId: '', motivo: '', dataInicio: '', dataFim: '' });
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState('');
  const [ocultando, setOcultando] = useState(false);

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const params = { page, limit: 10 };
      if (filtros.produtoId) params.produtoId = filtros.produtoId;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.usuarioId) params.usuarioId = filtros.usuarioId;
      if (filtros.motivo) params.motivo = filtros.motivo;
      if (filtros.dataInicio) params.dataInicio = filtros.dataInicio;
      if (filtros.dataFim) params.dataFim = filtros.dataFim;
      const res = await api.get('/movimentacoes', { params });
      setDados(res.data);
    } catch (err) {
      setErro(extrairErro(err));
    }
  }, [page, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    api.get('/produtos', { params: { status: 'ativos', limit: 100 } }).then((r) => setProdutos(r.data.data)).catch(() => {});
    api.get('/usuarios').then((r) => setUsuarios(r.data)).catch(() => {});
  }, []);

  function aplicar(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
    setPage(1);
  }

  async function ocultar(m) {
    const ok = window.confirm(
      `Ocultar ${m.tipo === 'ENTRADA' ? 'entrada' : 'saída'} de "${m.produto}"?\nA movimentação deixará de aparecer no histórico. O estoque não é alterado.`
    );
    if (!ok) return;
    setOcultando(true);
    setErro('');
    try {
      await api.delete(`/movimentacoes/${m.tipo}/${m.id}`);
      setDados((d) => ({
        ...d,
        data: d.data.filter((x) => !(x.id === m.id && x.tipo === m.tipo)),
        meta: { ...d.meta, total: Math.max(0, d.meta.total - 1) },
      }));
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setOcultando(false);
    }
  }

  return (
    <div>
      <h1 className="page-title h3 mb-1">Movimentações</h1>
      <p className="text-muted mb-4">Histórico de entradas e saídas de estoque</p>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-6 col-md-2">
            <select className="form-select" value={filtros.tipo} onChange={(e) => aplicar('tipo', e.target.value)}>
              <option value="">Tipo</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select" value={filtros.produtoId} onChange={(e) => aplicar('produtoId', e.target.value)}>
              <option value="">Produto</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={filtros.usuarioId} onChange={(e) => aplicar('usuarioId', e.target.value)}>
              <option value="">Usuário</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={filtros.motivo} onChange={(e) => aplicar('motivo', e.target.value)}>
              <option value="">Motivo</option>
              {MOTIVOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-1">
            <input type="date" className="form-control" value={filtros.dataInicio} onChange={(e) => aplicar('dataInicio', e.target.value)} title="De" />
          </div>
          <div className="col-6 col-md-1">
            <input type="date" className="form-control" value={filtros.dataFim} onChange={(e) => aplicar('dataFim', e.target.value)} title="Até" />
          </div>
          <div className="col-md-1 d-grid">
            <button className="btn btn-outline-secondary" title="Limpar filtros" onClick={() => { setFiltros({ produtoId: '', tipo: '', usuarioId: '', motivo: '', dataInicio: '', dataFim: '' }); setPage(1); }}>
              <i className="bi bi-eraser"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Quantidade</th>
                <th>Usuário</th>
                <th>Motivo</th>
                <th>Cliente / Fornecedor</th>
                <th>Observação</th>
                {isAdmin && <th className="text-center">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {!dados && <tr><td colSpan={isAdmin ? 9 : 8}><Loading /></td></tr>}
              {dados?.data.length === 0 && <tr><td colSpan={isAdmin ? 9 : 8}><EmptyState /></td></tr>}
              {dados?.data.map((m) => (
                <tr key={m.chave}>
                  <td className="small">{formatarDataHora(m.data)}</td>
                  <td className="fw-semibold">{m.produto}</td>
                  <td className="text-center">
                    {m.tipo === 'ENTRADA'
                      ? <span className="badge badge-normal">Entrada</span>
                      : <span className="badge badge-vencendo">Saída</span>}
                  </td>
                  <td className="text-center fw-semibold">
                    {m.tipo === 'ENTRADA' ? <span className="text-success">+{m.quantidade}</span> : <span className="text-warning">-{m.quantidade}</span>}
                  </td>
                  <td className="small">{m.usuario}</td>
                  <td className="small">{m.motivoLabel}</td>
                  <td className="small">{m.clienteTutor ?? m.fornecedor ?? '—'}</td>
                  <td className="small text-muted">{m.observacao ?? '—'}</td>
                  {isAdmin && (
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Ocultar movimentação"
                        disabled={ocultando}
                        onClick={() => ocultar(m)}
                      >
                        <i className="bi bi-eye-slash"></i>
                      </button>
                    </td>
                  )}
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
