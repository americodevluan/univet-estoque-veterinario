import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Notificacoes() {
  const [alertas, setAlertas] = useState(null);
  const [aberto, setAberto] = useState(false);
  // Guarda a "impressão digital" dos alertas no momento em que foram marcados como lidos.
  const [lidasFp, setLidasFp] = useState(() => sessionStorage.getItem('univetNotifFp') || '');
  const ref = useRef(null);

  function carregarAlertas() {
    api
      .get('/alertas')
      .then((r) => setAlertas(r.data))
      .catch(() => setAlertas(null));
  }

  useEffect(() => {
    carregarAlertas();
    // Busca novamente a cada 30s e ao voltar para a aba: novos alertas aparecem sozinhos.
    const id = setInterval(carregarAlertas, 30000);
    window.addEventListener('focus', carregarAlertas);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', carregarAlertas);
    };
  }, []);

  useEffect(() => {
    function aoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const total = alertas ? alertas.totais.estoqueBaixo + alertas.totais.vencidos + alertas.totais.vencendo30d : 0;

  // Fingerprint = ids dos produtos em alerta + totais. Mudou? São alertas novos.
  function fingerprint() {
    if (!alertas) return '';
    const ids = [
      ...(alertas.estoqueBaixo || []).map((p) => p.id),
      ...(alertas.vencidos || []).map((p) => p.id),
      ...(alertas.vencendo || []).map((p) => p.id),
    ]
      .sort((a, b) => a - b)
      .join(',');
    return `${alertas.totais.estoqueBaixo}|${alertas.totais.vencidos}|${alertas.totais.vencendo30d}|${ids}`;
  }

  const temNovas = total > 0 && fingerprint() !== lidasFp;

  // Abrir o painel NÃO marca como lidas: os alertas continuam visíveis
  // até o usuário clicar em "Marcar como lidas".
  function alternarPainel() {
    setAberto((v) => !v);
  }

  function marcarLidas() {
    const fp = fingerprint();
    setLidasFp(fp);
    sessionStorage.setItem('univetNotifFp', fp);
  }

  return (
    <div className="vet-notification-root position-relative" ref={ref}>
      <button
        className="btn btn-light position-relative border-0"
        onClick={alternarPainel}
        aria-label="Notificações"
      >
        <i className="bi bi-bell fs-5"></i>
        {temNovas && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {total}
          </span>
        )}
      </button>

      {aberto && alertas && (
        <div
          className="vet-notification-popover card position-absolute end-0 mt-2 shadow"
        >
          <div className="card-header bg-white d-flex align-items-center justify-content-between gap-2">
            <span className="fw-semibold">Notificações</span>
            {temNovas && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={marcarLidas}
              >
                <i className="bi bi-check2-all me-1"></i>Marcar como lidas
              </button>
            )}
          </div>
          <div className="vet-notif-popover list-group list-group-flush">
            {total === 0 || !temNovas ? (
              <div className="list-group-item text-muted">Nenhum alerta no momento.</div>
            ) : (
            <>
            {alertas.totais.estoqueBaixo > 0 && (
              <div className="list-group-item">
                <span className="badge badge-baixo me-2">Estoque baixo</span>
                {alertas.totais.estoqueBaixo} produto(s) abaixo do estoque mínimo.
                <ul className="small text-muted mt-1 mb-0 ps-3">
                  {alertas.estoqueBaixo.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      {p.nome} — {p.quantidadeAtual} / mín {p.quantidadeMinima}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {alertas.totais.vencidos > 0 && (
              <div className="list-group-item">
                <span className="badge badge-vencido me-2">Vencidos</span>
                {alertas.totais.vencidos} produto(s) vencido(s).
                <ul className="small text-muted mt-1 mb-0 ps-3">
                  {alertas.vencidos.slice(0, 5).map((p) => (
                    <li key={p.id}>{p.nome} — validade {new Date(p.dataValidade).toLocaleDateString('pt-BR')}</li>
                  ))}
                </ul>
              </div>
            )}
            {alertas.totais.vencendo30d > 0 && (
              <div className="list-group-item">
                <span className="badge badge-vencendo me-2">Vencendo 30d</span>
                {alertas.totais.vencendo30d} produto(s) vencem nos próximos 30 dias.
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const itens = [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
    { to: '/produtos', icon: 'bi-box-seam', label: 'Produtos' },
    { to: '/categorias', icon: 'bi-tags', label: 'Categorias' },
    { to: '/fornecedores', icon: 'bi-truck', label: 'Fornecedores' },
    { to: '/entradas', icon: 'bi-box-arrow-in-down', label: 'Entradas' },
    { to: '/saidas', icon: 'bi-box-arrow-up', label: 'Saídas' },
    { to: '/movimentacoes', icon: 'bi-arrow-left-right', label: 'Movimentações' },
    { to: '/relatorios', icon: 'bi-file-earmark-bar-graph', label: 'Relatórios' },
    ...(isAdmin ? [{ to: '/usuarios', icon: 'bi-people', label: 'Usuários' }] : []),
    { to: '/configuracoes', icon: 'bi-gear', label: 'Configurações' },
  ];

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="vet-sidebar d-flex flex-column p-3">
      <div className="vet-logo d-flex align-items-center gap-2 mb-4 px-2">
        <img className="vet-logo-image" src="/logo-clinica.jpg" alt="UniVet" />
        <div>
          <div className="fw-bold fs-5 lh-1">UniVet</div>
          <div className="small opacity-75">Clínica Veterinária</div>
        </div>
      </div>

      <nav className="nav flex-column flex-grow-1">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-top pt-3 mt-3">
        <div className="px-2 mb-2 small text-white-50">
          <div className="fw-semibold text-white">{usuario?.nome}</div>
          <div>{usuario?.perfil}</div>
        </div>
        <button className="nav-link w-100 text-start" onClick={() => { sair(); onNavigate?.(); }}>
          <i className="bi bi-box-arrow-right"></i>
          Sair
        </button>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { usuario } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar fixa em telas grandes; ocultável em telas pequenas */}
      <div className="d-none d-lg-block" style={{ width: 240, flexShrink: 0 }}>
        <div className="position-fixed" style={{ width: 240, top: 0, bottom: 0 }}>
          <Sidebar />
        </div>
      </div>

      <div className="flex-grow-1 d-flex flex-column min-vh-100">
        <header className="vet-topbar d-flex align-items-center justify-content-between px-3 px-md-4 py-2">
          <div className="d-flex align-items-center gap-2">
            <button
              className="vet-menu-toggle btn btn-light d-lg-none border-0"
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto(true)}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            <span className="d-lg-none fw-bold text-primary">UniVet</span>
            <span className="text-muted d-none d-sm-inline small">
              Clínica Veterinária Fernanda Calixto
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Notificacoes />
            <div className="d-none d-sm-flex align-items-center gap-2 border-start ps-3">
              <div className="text-end lh-1">
                <div className="fw-semibold small">{usuario?.nome}</div>
                <div className="text-muted small">{usuario?.perfil}</div>
              </div>
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                {usuario?.nome?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="vet-main-content flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>

        <footer className="text-center text-muted small py-3 border-top bg-white">
          UniVet — Projeto Integrador · Clínica Veterinária Fernanda Calixto
        </footer>
      </div>

      {menuAberto && (
        <div className="vet-mobile-menu-layer d-lg-none">
          <button
            className="vet-mobile-menu-backdrop"
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
          />
          <aside className="vet-mobile-sidebar">
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-light border-0"
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMenuAberto(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <Sidebar onNavigate={() => setMenuAberto(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
