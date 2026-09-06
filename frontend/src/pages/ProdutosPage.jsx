import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState, Paginacao, ValidadeBadge, EstoqueBadge, formatarMoeda, formatarData } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const LIMITE = 10;

export default function ProdutosPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    categoriaId: '',
    fornecedorId: '',
    status: 'ativos',
    validade: '',
  });
  const [page, setPage] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [erro, setErro] = useState('');

  const [ver, setVer] = useState(null);
  const [mov, setMov] = useState(null); // { tipo: 'ENTRADA'|'SAIDA', produto }
  const [confirmar, setConfirmar] = useState(null);
  const [carregandoAcao, setCarregandoAcao] = useState(false);

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const params = { page, limit: LIMITE };
      if (filtros.search) params.search = filtros.search;
      if (filtros.categoriaId) params.categoriaId = filtros.categoriaId;
      if (filtros.fornecedorId) params.fornecedorId = filtros.fornecedorId;
      if (filtros.status) params.status = filtros.status;
      if (filtros.validade) params.validade = filtros.validade;
      const res = await api.get('/produtos', { params });
      setDados(res.data);
    } catch (err) {
      setErro(extrairErro(err));
    }
  }, [page, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    api.get('/categorias').then((r) => setCategorias(r.data)).catch(() => {});
    api.get('/fornecedores').then((r) => setFornecedores(r.data)).catch(() => {});
  }, []);

  function aplicarFiltro(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
    setPage(1);
  }

  async function confirmarInativar() {
    setCarregandoAcao(true);
    try {
      await api.delete(`/produtos/${confirmar.id}`);
      setConfirmar(null);
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregandoAcao(false);
    }
  }

  async function salvarMovimentacao() {
    setCarregandoAcao(true);
    try {
      if (mov.tipo === 'ENTRADA') {
        await api.post('/entradas', {
          produtoId: mov.produto.id,
          quantidade: Number(mov.quantidade),
          lote: mov.lote || null,
          dataValidade: mov.dataValidade || null,
          valorCompra: mov.valorCompra === '' ? undefined : Number(mov.valorCompra),
          fornecedorId: mov.fornecedorId || null,
          observacao: mov.observacao || null,
        });
      } else {
        await api.post('/saidas', {
          produtoId: mov.produto.id,
          quantidade: Number(mov.quantidade),
          motivo: mov.motivo,
          clienteTutor: mov.clienteTutor || null,
          observacao: mov.observacao || null,
        });
      }
      setMov(null);
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregandoAcao(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="page-title h3 mb-0">Produtos</h1>
          <span className="text-muted">{dados ? `${dados.meta.total} produto(s) cadastrado(s)` : ''}</span>
        </div>
        {isAdmin && (
          <Link to="/produtos/novo" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i>Novo Produto
          </Link>
        )}
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

      {/* Filtros */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                className="form-control"
                placeholder="Buscar por nome ou código..."
                value={filtros.search}
                onChange={(e) => aplicarFiltro('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtros.categoriaId}
              onChange={(e) => aplicarFiltro('categoriaId', e.target.value)}
            >
              <option value="">Categoria</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtros.fornecedorId}
              onChange={(e) => aplicarFiltro('fornecedorId', e.target.value)}
            >
              <option value="">Fornecedor</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtros.status}
              onChange={(e) => aplicarFiltro('status', e.target.value)}
            >
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtros.validade}
              onChange={(e) => aplicarFiltro('validade', e.target.value)}
            >
              <option value="">Validade</option>
              <option value="vencido">Vencidos</option>
              <option value="vencendo">Vencendo 30d</option>
              <option value="valido">Válidos</option>
            </select>
          </div>
          <div className="col-md-1 d-grid">
            <button className="btn btn-outline-secondary" onClick={() => { setFiltros({ search: '', categoriaId: '', fornecedorId: '', status: 'ativos', validade: '' }); setPage(1); }}>
              <i className="bi bi-eraser"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th className="text-center">Estoque</th>
                <th className="text-center">Mínimo</th>
                <th>Lote</th>
                <th>Validade</th>
                <th className="text-end">Valor Venda</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!dados && (
                <tr><td colSpan={11}><Loading /></td></tr>
              )}
              {dados && dados.data.length === 0 && (
                <tr><td colSpan={11}><EmptyState /></td></tr>
              )}
              {dados?.data.map((p) => (
                <tr key={p.id}>
                  <td className="text-muted small">{p.codigo}</td>
                  <td className="fw-semibold">{p.nome}</td>
                  <td>{p.categoria?.nome ?? '—'}</td>
                  <td className="small">{p.fornecedor?.nome ?? '—'}</td>
                  <td className="text-center"><EstoqueBadge atual={p.quantidadeAtual} minimo={p.quantidadeMinima} ativo={p.ativo} /></td>
                  <td className="text-center text-muted">{p.quantidadeMinima}</td>
                  <td className="small">{p.lote ?? '—'}</td>
                  <td><ValidadeBadge situacao={p.situacaoValidade} dias={p.diasParaVencimento} /></td>
                  <td className="text-end">{formatarMoeda(p.valorVenda)}</td>
                  <td>{p.ativo ? <span className="badge badge-normal">Ativo</span> : <span className="badge badge-inativo">Inativo</span>}</td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" title="Visualizar" onClick={() => setVer(p)}>
                        <i className="bi bi-eye"></i>
                      </button>
                      {isAdmin && (
                        <>
                          <button className="btn btn-outline-primary" title="Editar" onClick={() => navigate(`/produtos/${p.id}/editar`)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-success" title="Entrada" onClick={() => setMov({ tipo: 'ENTRADA', produto: p, quantidade: '', lote: '', dataValidade: '', valorCompra: '', fornecedorId: '', observacao: '' })}>
                            <i className="bi bi-box-arrow-in-down"></i>
                          </button>
                          <button className="btn btn-outline-warning" title="Saída" onClick={() => setMov({ tipo: 'SAIDA', produto: p, quantidade: '', motivo: 'VENDA', clienteTutor: '', observacao: '' })}>
                            <i className="bi bi-box-arrow-up"></i>
                          </button>
                          <button className="btn btn-outline-danger" title="Inativar" onClick={() => setConfirmar(p)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3">
          <Paginacao meta={dados?.meta} onChange={setPage} />
        </div>
      </div>

      {/* Modal visualizar */}
      <Modal show={!!ver} onHide={() => setVer(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{ver?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ver && (
            <dl className="row mb-0 small">
              <dt className="col-sm-5">Código</dt><dd className="col-sm-7">{ver.codigo}</dd>
              <dt className="col-sm-5">Categoria</dt><dd className="col-sm-7">{ver.categoria?.nome ?? '—'}</dd>
              <dt className="col-sm-5">Fornecedor</dt><dd className="col-sm-7">{ver.fornecedor?.nome ?? '—'}</dd>
              <dt className="col-sm-5">Descrição</dt><dd className="col-sm-7">{ver.descricao ?? '—'}</dd>
              <dt className="col-sm-5">Unidade</dt><dd className="col-sm-7">{ver.unidadeMedida}</dd>
              <dt className="col-sm-5">Estoque</dt><dd className="col-sm-7">{ver.quantidadeAtual} (mín {ver.quantidadeMinima})</dd>
              <dt className="col-sm-5">Valor compra</dt><dd className="col-sm-7">{formatarMoeda(ver.valorCompra)}</dd>
              <dt className="col-sm-5">Valor venda</dt><dd className="col-sm-7">{formatarMoeda(ver.valorVenda)}</dd>
              <dt className="col-sm-5">Lote</dt><dd className="col-sm-7">{ver.lote ?? '—'}</dd>
              <dt className="col-sm-5">Validade</dt><dd className="col-sm-7">{formatarData(ver.dataValidade)}</dd>
              <dt className="col-sm-5">Status</dt>
              <dd className="col-sm-7">{ver.ativo ? 'Ativo' : 'Inativo'} · {ver._count?.entradas ?? 0} entradas · {ver._count?.saidas ?? 0} saídas</dd>
            </dl>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal movimentação */}
      <Modal show={!!mov} onHide={() => setMov(null)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {mov?.tipo === 'ENTRADA' ? <><i className="bi bi-box-arrow-in-down text-success me-1"></i>Entrada</> : <><i className="bi bi-box-arrow-up text-warning me-1"></i>Saída</>} — {mov?.produto?.nome}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mov && (
            <div className="small mb-3">
              Estoque atual: <strong>{mov.produto.quantidadeAtual}</strong> {mov.produto.unidadeMedida} · Mínimo: {mov.produto.quantidadeMinima}
              {mov.produto.situacaoValidade === 'VENCIDO' && (
                <div className="alert alert-danger py-2 mt-2 mb-0">
                  <i className="bi bi-x-circle me-1"></i>Produto vencido! Só é permitido dar baixa (motivo Vencimento/Perda/Avaria).
                </div>
              )}
            </div>
          )}
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Quantidade *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={mov?.quantidade ?? ''}
                onChange={(e) => setMov((m) => ({ ...m, quantidade: e.target.value }))}
              />
            </div>
            {mov?.tipo === 'SAIDA' && (
              <div className="col-6">
                <label className="form-label">Motivo *</label>
                <select className="form-select" value={mov?.motivo ?? ''} onChange={(e) => setMov((m) => ({ ...m, motivo: e.target.value }))}>
                  <option value="VENDA">Venda</option>
                  <option value="USO_CLINICO">Uso clínico</option>
                  <option value="AVARIA">Avaria</option>
                  <option value="VENCIMENTO">Vencimento</option>
                  <option value="PERDA">Perda</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
            )}
            {mov?.tipo === 'ENTRADA' && (
              <>
                <div className="col-6">
                  <label className="form-label">Lote</label>
                  <input className="form-control" value={mov.lote} onChange={(e) => setMov((m) => ({ ...m, lote: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Data de validade</label>
                  <input type="date" className="form-control" value={mov.dataValidade} onChange={(e) => setMov((m) => ({ ...m, dataValidade: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Valor de compra</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={mov.valorCompra} onChange={(e) => setMov((m) => ({ ...m, valorCompra: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Fornecedor</label>
                  <select className="form-select" value={mov.fornecedorId} onChange={(e) => setMov((m) => ({ ...m, fornecedorId: e.target.value }))}>
                    <option value="">—</option>
                    {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </div>
              </>
            )}
            {mov?.tipo === 'SAIDA' && (
              <div className="col-6">
                <label className="form-label">Cliente / Tutor</label>
                <input className="form-control" value={mov.clienteTutor} onChange={(e) => setMov((m) => ({ ...m, clienteTutor: e.target.value }))} />
              </div>
            )}
            <div className="col-12">
              <label className="form-label">Observação</label>
              <input className="form-control" value={mov?.observacao ?? ''} onChange={(e) => setMov((m) => ({ ...m, observacao: e.target.value }))} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMov(null)}>Cancelar</Button>
          <Button
            variant={mov?.tipo === 'ENTRADA' ? 'success' : 'warning'}
            onClick={salvarMovimentacao}
            disabled={carregandoAcao || !mov?.quantidade || Number(mov.quantidade) < 1}
          >
            {carregandoAcao ? 'Salvando...' : 'Registrar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar inativação */}
      <Modal show={!!confirmar} onHide={() => setConfirmar(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Inativar produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja inativar <strong>{confirmar?.nome}</strong>? O produto deixará de aparecer nas movimentações, mas o histórico será mantido.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarInativar} disabled={carregandoAcao}>
            {carregandoAcao ? 'Inativando...' : 'Inativar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
