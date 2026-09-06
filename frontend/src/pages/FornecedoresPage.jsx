import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const VAZIO = { id: null, nome: '', cnpj: '', telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '' };

export default function FornecedoresPage() {
  const { isAdmin } = useAuth();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = () => {
    api.get('/fornecedores/todos').then((r) => setLista(r.data)).catch((err) => setErro(extrairErro(err)));
  };

  useEffect(carregar, []);

  function abrirNovo() {
    setErroForm('');
    setModal({ ...VAZIO });
  }

  function abrirEdicao(f) {
    setErroForm('');
    setModal({ id: f.id, nome: f.nome, cnpj: f.cnpj ?? '', telefone: f.telefone ?? '', email: f.email ?? '', endereco: f.endereco ?? '', cidade: f.cidade ?? '', estado: f.estado ?? '', cep: f.cep ?? '' });
  }

  async function salvar(e) {
    e.preventDefault();
    if (!modal.nome.trim()) {
      setErroForm('O nome do fornecedor é obrigatório.');
      return;
    }
    setCarregandoAcao(true);
    setErroForm('');
    try {
      const body = { ...modal, id: undefined };
      if (modal.id) await api.put(`/fornecedores/${modal.id}`, body);
      else await api.post('/fornecedores', body);
      setModal(null);
      carregar();
    } catch (err) {
      setErroForm(extrairErro(err));
    } finally {
      setCarregandoAcao(false);
    }
  }

  async function inativar() {
    setCarregandoAcao(true);
    try {
      await api.delete(`/fornecedores/${confirmar.id}`);
      setConfirmar(null);
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregandoAcao(false);
    }
  }

  function visualizar(f) {
    api.get(`/fornecedores/${f.id}`).then((r) => setDetalhe(r.data)).catch((err) => setErro(extrairErro(err)));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title h3 mb-0">Fornecedores</h1>
          <span className="text-muted">Empresas que fornecem medicamentos e produtos</span>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1"></i>Novo Fornecedor
          </button>
        )}
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>Cidade/UF</th>
                <th className="text-center">Produtos</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!lista && <tr><td colSpan={7}><Loading /></td></tr>}
              {lista?.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
              {lista?.map((f) => (
                <tr key={f.id}>
                  <td className="fw-semibold">{f.nome}</td>
                  <td className="small">{f.cnpj ?? '—'}</td>
                  <td className="small">{f.telefone ?? '—'}</td>
                  <td className="small">{f.cidade ? `${f.cidade}/${f.estado ?? ''}` : '—'}</td>
                  <td className="text-center">{f._count.produtos}</td>
                  <td>{f.ativo ? <span className="badge badge-normal">Ativo</span> : <span className="badge badge-inativo">Inativo</span>}</td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" title="Visualizar" onClick={() => visualizar(f)}>
                        <i className="bi bi-eye"></i>
                      </button>
                      {isAdmin && (
                        <>
                          <button className="btn btn-outline-primary" title="Editar" onClick={() => abrirEdicao(f)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          {f.ativo && (
                            <button className="btn btn-outline-danger" title="Inativar" onClick={() => setConfirmar(f)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulário */}
      <Modal show={!!modal} onHide={() => setModal(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modal?.id ? 'Editar fornecedor' : 'Novo fornecedor'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={salvar}>
          <Modal.Body>
            {erroForm && <div className="alert alert-danger py-2 small">{erroForm}</div>}
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Nome *</label>
                <input className="form-control" value={modal?.nome ?? ''} onChange={(e) => setModal((m) => ({ ...m, nome: e.target.value }))} autoFocus />
              </div>
              <div className="col-md-4">
                <label className="form-label">CNPJ</label>
                <input className="form-control" placeholder="00.000.000/0000-00" value={modal?.cnpj ?? ''} onChange={(e) => setModal((m) => ({ ...m, cnpj: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={modal?.telefone ?? ''} onChange={(e) => setModal((m) => ({ ...m, telefone: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-control" value={modal?.email ?? ''} onChange={(e) => setModal((m) => ({ ...m, email: e.target.value }))} />
              </div>
              <div className="col-12">
                <label className="form-label">Endereço</label>
                <input className="form-control" value={modal?.endereco ?? ''} onChange={(e) => setModal((m) => ({ ...m, endereco: e.target.value }))} />
              </div>
              <div className="col-md-5">
                <label className="form-label">Cidade</label>
                <input className="form-control" value={modal?.cidade ?? ''} onChange={(e) => setModal((m) => ({ ...m, cidade: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">UF</label>
                <input className="form-control" maxLength={2} value={modal?.estado ?? ''} onChange={(e) => setModal((m) => ({ ...m, estado: e.target.value.toUpperCase() }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">CEP</label>
                <input className="form-control" placeholder="00000-000" value={modal?.cep ?? ''} onChange={(e) => setModal((m) => ({ ...m, cep: e.target.value }))} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={carregandoAcao}>{carregandoAcao ? 'Salvando...' : 'Salvar'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Modal detalhe com produtos relacionados */}
      <Modal show={!!detalhe} onHide={() => setDetalhe(null)}>
        <Modal.Header closeButton><Modal.Title>{detalhe?.nome}</Modal.Title></Modal.Header>
        <Modal.Body>
          <dl className="row small mb-3">
            <dt className="col-sm-4">CNPJ</dt><dd className="col-sm-8">{detalhe?.cnpj ?? '—'}</dd>
            <dt className="col-sm-4">Telefone</dt><dd className="col-sm-8">{detalhe?.telefone ?? '—'}</dd>
            <dt className="col-sm-4">E-mail</dt><dd className="col-sm-8">{detalhe?.email ?? '—'}</dd>
            <dt className="col-sm-4">Endereço</dt><dd className="col-sm-8">{detalhe ? `${detalhe.endereco ?? ''} ${detalhe.cidade ?? ''}/${detalhe.estado ?? ''} ${detalhe.cep ?? ''}` : ''}</dd>
          </dl>
          <h2 className="h6 fw-bold">Produtos relacionados ({detalhe?.produtos?.length ?? 0})</h2>
          {detalhe?.produtos?.length === 0 && <p className="text-muted small mb-0">Nenhum produto vinculado.</p>}
          <ul className="list-group list-group-flush">
            {detalhe?.produtos.map((p) => (
              <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                <span>{p.nome}</span>
                <span className="text-muted small">{p.quantidadeAtual} {p.unidadeMedida}</span>
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>

      <Modal show={!!confirmar} onHide={() => setConfirmar(null)}>
        <Modal.Header closeButton><Modal.Title>Inativar fornecedor</Modal.Title></Modal.Header>
        <Modal.Body>Deseja inativar <strong>{confirmar?.nome}</strong>? O histórico será mantido.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={inativar} disabled={carregandoAcao}>{carregandoAcao ? 'Inativando...' : 'Inativar'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
