import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extrairErro } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(email, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="vet-login p-3">
      <div className="card shadow-lg p-4 p-md-5">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-light rounded-3 p-3 mb-3">
            <i className="bi bi-heart-pulse-fill fs-1 text-primary"></i>
          </div>
          <h1 className="h4 fw-bold mb-1">VetStock</h1>
          <p className="text-muted mb-0">Controle de Estoque Veterinário</p>
        </div>

        {erro && (
          <div className="alert alert-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-circle me-1"></i>{erro}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-muted small text-center mt-4 mb-0">
          Demonstração: admin@clinica.com / admin123 · funcionario@clinica.com / func123
        </p>
      </div>
    </div>
  );
}
