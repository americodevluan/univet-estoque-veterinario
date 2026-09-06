import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function CategoriasPage() {
  const { isAdmin } = useAuth();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null); // { id?, nome, descricao }
  const [confirmar, setConfirmar] = useState(null);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = () => {
    api.get('/categorias/todas').then((r) => setLista(r.data)).catch((err) => setErro(extrairErro(err)));
  };

  useEffect(carregar, []);

  function abrirNovo() {
    setErroForm('');
    setModal({ id: null, nome: '', descricao: '' });
  }

  function abrirEdicao(c) {
    setErroForm('');
    setModal({ id: c.id, nome: c.nome, descricao: c.descricao ?? '' });
  }

  async function salvar(e) {
    e.preventDefault();
    if (!modal.nome.trim()) {
      setErroForm('O nome é obrigatório.');
      return;
    }
    setCarregandoAcao(true);
    setErroForm('');
    try {
      if (modal.id) {
        await api.put(`/categorias/${modal.id}`, { nome: modal.nome, descricao: modal.descricao });
      } else {
        await api.post('/categorias', { nome: modal.nome, descricao: modal.descricao });
      }
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
      await api.delete(`/categorias/${confirmar.id}`);
      setConfirmar(null);
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregandoAcao(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title h3 mb-0">Categorias</h1>
          <span className="text-muted">Classificação dos produtos</span>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1"></i>Nova Categoria
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
                <th>Descrição</th>
                <th className="text-center">Produtos</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!lista && <tr><td colSpan={5}><Loading /></td></tr>}
              {lista?.length === 0 && <tr><td colSpan={5}><EmptyState /></td></tr>}
              {lista?.map((c) => (
                <tr key={c.id}>
                  <td className="fw-semibold">{c.nome}</td>
                  <td className="small text-muted">{c.descricao ?? '—'}</td>
                  <td className="text-center">{c._count.produtos}</td>
                  <td>{c.ativo ? <span className="badge badge-normal">Ativa</span> : <span className="badge badge-inativo">Inativa</span>}</td>
                  <td className="text-center">
                    {isAdmin && (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" title="Editar" onClick={() => abrirEdicao(c)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        {c.ativo && (
                          <button className="btn btn-outline-danger" title="Inativar" onClick={() => setConfirmar(c)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={!!modal} onHide={() => setModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{modal?.id ? 'Editar categoria' : 'Nova categoria'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={salvar}>
          <Modal.Body>
            {erroForm && <div className="alert alert-danger py-2 small">{erroForm}</div>}
            <div className="mb-3">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={modal?.nome ?? ''} onChange={(e) => setModal((m) => ({ ...m, nome: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="form-label">Descrição</label>
              <textarea className="form-control" rows="2" value={modal?.descricao ?? ''} onChange={(e) => setModal((m) => ({ ...m, descricao: e.target.value }))} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={carregandoAcao}>{carregandoAcao ? 'Salvando...' : 'Salvar'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!confirmar} onHide={() => setConfirmar(null)}>
        <Modal.Header closeButton><Modal.Title>Inativar categoria</Modal.Title></Modal.Header>
        <Modal.Body>
          Deseja inativar <strong>{confirmar?.nome}</strong>? Produtos vinculados permanecem cadastrados.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={inativar} disabled={carregandoAcao}>{carregandoAcao ? 'Inativando...' : 'Inativar'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
