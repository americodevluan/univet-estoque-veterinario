// Componentes e utilitários pequenos compartilhados entre as páginas

export function Loading({ texto = 'Carregando...' }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{texto}</span>
      </div>
      <p className="text-muted mt-2 mb-0">{texto}</p>
    </div>
  );
}

export function EmptyState({ texto = 'Nenhum registro encontrado.' }) {
  return (
    <div className="text-center py-5 text-muted-2">
      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
      {texto}
    </div>
  );
}

// Badge de situação de validade
export function ValidadeBadge({ situacao, dias }) {
  if (!situacao) return <span className="badge badge-normal">Sem validade</span>;
  if (situacao === 'VENCIDO')
    return <span className="badge badge-vencido"><i className="bi bi-x-circle me-1"></i>Vencido</span>;
  if (situacao === 'VENCENDO')
    return (
      <span className="badge badge-vencendo">
        <i className="bi bi-exclamation-triangle me-1"></i>
        {dias <= 0 ? 'Vence hoje' : `Vence em ${dias}d`}
      </span>
    );
  return <span className="badge badge-valido"><i className="bi bi-check-circle me-1"></i>Válido</span>;
}

// Badge de estoque
export function EstoqueBadge({ atual, minimo, ativo }) {
  if (!ativo) return <span className="badge badge-inativo">Inativo</span>;
  if (atual <= minimo)
    return (
      <span className="badge badge-baixo">
        <i className="bi bi-exclamation-triangle me-1"></i>{atual} / mín {minimo}
      </span>
    );
  return <span className="badge badge-normal">{atual}</span>;
}

// Paginação
export function Paginacao({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;
  const paginas = [];
  for (let p = 1; p <= totalPages; p++) paginas.push(p);

  return (
    <nav className="d-flex justify-content-between align-items-center mt-3">
      <span className="text-muted small">
        Página {page} de {totalPages} · {meta.total} registro(s)
      </span>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)} aria-label="Anterior">
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>
        {paginas.map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)} aria-label="Próxima">
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}

// Formata valores em Real
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata datas ISO em dd/mm/aaaa
export function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function formatarDataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
