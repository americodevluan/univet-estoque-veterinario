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
  const [sessaoExpirada] = useState(() => sessionStorage.getItem('sessaoExpirada') === '1');

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
    <div className="vet-login">
      <div className="card p-4 p-md-5">
        <div className="univet-login-brand mb-4">
          <img className="univet-login-logo" src="/logo-clinica.jpg" alt="Clínica Veterinária Fernanda Calixto" />
          <div>
            <span className="univet-pill">Acesso seguro da clínica</span>
            <h1 className="h2 fw-bold mt-3 mb-2">Bem-vinda ao UniVet</h1>
            <p className="text-muted mb-0">
              Controle de estoque da Clínica Veterinária Fernanda Calixto.
            </p>
          </div>
        </div>

        {sessaoExpirada && (
          <div className="alert alert-warning py-2 small" role="alert">
            <i className="bi bi-clock-history me-1"></i>Sua sessão expirou. Faça login novamente.
          </div>
        )}

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
            'Entrar na página inicial'
            )}
          </button>
        </form>

        <div className="univet-login-highlight small text-muted p-3 mt-4">
          <strong>Acesso de demonstração</strong><br />
          Administrador: admin@clinica.com / admin123<br />
          Funcionário: funcionario@clinica.com / func123
        </div>
      </div>
    </div>
  );
}
