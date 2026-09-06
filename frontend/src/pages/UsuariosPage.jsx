import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState, formatarData } from '../components/ui';

const INICIAL = { id: null, nome: '', email: '', perfil: 'FUNCIONARIO', senha: '' };

export default function UsuariosPage() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = () => {
    api.get('/usuarios').then((r) => setLista(r.data)).catch((err) => setErro(extrairErro(err)));
  };

  useEffect(carregar, []);

  function abrirNovo() {
    setErroForm('');
    setModal({ ...INICIAL });
  }

  function abrirEdicao(u) {
    setErroForm('');
    setModal({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, senha: '' });
  }

  async function salvar(e) {
    e.preventDefault();
    if (!modal.nome.trim() || !modal.email.trim()) {
      setErroForm('Nome e e-mail são obrigatórios.');
      return;
    }
    if (!modal.id && (!modal.senha || modal.senha.length < 6)) {
      setErroForm('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setCarregandoAcao(true);
    setErroForm('');
    try {
      if (modal.id) {
        const body = { nome: modal.nome, email: modal.email, perfil: modal.perfil };
        if (modal.senha) body.senha = modal.senha;
        await api.put(`/usuarios/${modal.id}`, body);
      } else {
        await api.post('/usuarios', { nome: modal.nome, email: modal.email, perfil: modal.perfil, senha: modal.senha });
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
      await api.delete(`/usuarios/${confirmar.id}`);
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
          <h1 className="page-title h3 mb-0">Usuários</h1>
          <span className="text-muted">Controle de acesso ao sistema (somente administradores)</span>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <i className="bi bi-person-plus me-1"></i>Novo Usuário
        </button>
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Criado em</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!lista && <tr><td colSpan={6}><Loading /></td></tr>}
              {lista?.length === 0 && <tr><td colSpan={6}><EmptyState /></td></tr>}
              {lista?.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.perfil === 'ADMIN'
                      ? <span className="badge badge-valido">Admin</span>
                      : <span className="badge badge-normal">Funcionário</span>}
                  </td>
                  <td className="small">{formatarData(u.createdAt)}</td>
                  <td>{u.ativo ? <span className="badge badge-normal">Ativo</span> : <span className="badge badge-inativo">Inativo</span>}</td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="Editar" onClick={() => abrirEdicao(u)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      {u.ativo && (
                        <button className="btn btn-outline-danger" title="Inativar" onClick={() => setConfirmar(u)}>
                          <i className="bi bi-person-x"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={!!modal} onHide={() => setModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{modal?.id ? 'Editar usuário' : 'Novo usuário'}</Modal.Title>
        </Modal.Header>
        <form onSubmit={salvar}>
          <Modal.Body>
            {erroForm && <div className="alert alert-danger py-2 small">{erroForm}</div>}
            <div className="mb-3">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={modal?.nome ?? ''} onChange={(e) => setModal((m) => ({ ...m, nome: e.target.value }))} autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label">E-mail *</label>
              <input type="email" className="form-control" value={modal?.email ?? ''} onChange={(e) => setModal((m) => ({ ...m, email: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Perfil</label>
              <select className="form-select" value={modal?.perfil ?? ''} onChange={(e) => setModal((m) => ({ ...m, perfil: e.target.value }))}>
                <option value="FUNCIONARIO">Funcionário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="form-label">{modal?.id ? 'Nova senha (opcional)' : 'Senha *'}</label>
              <input type="password" className="form-control" placeholder="Mínimo 6 caracteres" value={modal?.senha ?? ''} onChange={(e) => setModal((m) => ({ ...m, senha: e.target.value }))} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={carregandoAcao}>{carregandoAcao ? 'Salvando...' : 'Salvar'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!confirmar} onHide={() => setConfirmar(null)}>
        <Modal.Header closeButton><Modal.Title>Inativar usuário</Modal.Title></Modal.Header>
        <Modal.Body>Deseja inativar <strong>{confirmar?.nome}</strong>? O usuário não poderá mais acessar o sistema.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={inativar} disabled={carregandoAcao}>{carregandoAcao ? 'Inativando...' : 'Inativar'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
