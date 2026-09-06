import { useEffect, useRef, useState } from 'react';
import api, { extrairErro } from '../services/api';
import { Loading, EmptyState, formatarDataHora, formatarMoeda } from '../components/ui';

// Tipos de relatório disponíveis
const RELATORIOS = {
  estoque: { titulo: 'Relatório de Estoque', descricao: 'Todos os produtos e quantidades atuais', caminho: '/relatorios/estoque' },
  estoqueBaixo: { titulo: 'Relatório de Estoque Baixo', descricao: 'Produtos abaixo do estoque mínimo', caminho: '/relatorios/estoque-baixo' },
  validade: { titulo: 'Relatório de Validade', descricao: 'Vencidos, vencendo em 30 dias e válidos', caminho: '/relatorios/validade' },
  movimentacoes: { titulo: 'Relatório de Movimentações', descricao: 'Entradas e saídas em um período', caminho: '/relatorios/movimentacoes' },
};

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState('estoque');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const printRef = useRef(null);

  const config = RELATORIOS[tipo];

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const params = {};
      if (tipo === 'movimentacoes') {
        if (dataInicio) params.dataInicio = dataInicio;
        if (dataFim) params.dataFim = dataFim;
      }
      const res = await api.get(config.caminho, { params });
      setDados(res.data);
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  function baixarCSV() {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ formato: 'csv' });
    if (tipo === 'movimentacoes') {
      if (dataInicio) params.set('dataInicio', dataInicio);
      if (dataFim) params.set('dataFim', dataFim);
    }
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3333/api'}${config.caminho}?${params}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${tipo}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => setErro('Não foi possível baixar o CSV.'));
  }

  function imprimirPDF() {
    window.print();
  }

  return (
    <div>
      <h1 className="page-title h3 mb-1">Relatórios</h1>
      <p className="text-muted mb-4">Relatórios gerenciais com exportação para CSV e PDF (impressão)</p>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Tipo de relatório</label>
          <select className="form-select" value={tipo} onChange={(e) => { setTipo(e.target.value); setDados(null); }}>
            {Object.entries(RELATORIOS).map(([k, r]) => <option key={k} value={k}>{r.titulo}</option>)}
          </select>
        </div>
        {tipo === 'movimentacoes' && (
          <>
            <div className="col-6 col-md-2">
              <label className="form-label">De</label>
              <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Até</label>
              <input type="date" className="form-control" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </>
        )}
        <div className="col-12 col-md-3 d-flex align-items-end gap-2">
          <button className="btn btn-primary" onClick={carregar} disabled={carregando}>
            <i className="bi bi-arrow-clockwise me-1"></i>Gerar
          </button>
          <button className="btn btn-outline-success" onClick={baixarCSV} title="Exportar CSV (Excel)">
            <i className="bi bi-filetype-csv me-1"></i>CSV
          </button>
          <button className="btn btn-outline-danger" onClick={imprimirPDF} title="Exportar PDF (impressão)">
            <i className="bi bi-filetype-pdf me-1"></i>PDF
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger py-2 small">{erro}</div>}

      {/* Conteúdo do relatório (área impressa) */}
      <div className="card p-4" ref={printRef}>
        <div className="d-none d-print-block text-center mb-3">
          <h1 className="h5 fw-bold">UniVet — {config.titulo}</h1>
          <div className="small">Gerado em {new Date().toLocaleString('pt-BR')}</div>
        </div>
        <h2 className="h6 fw-bold d-print-none mb-3">{config.titulo}</h2>
        <p className="text-muted small d-print-none">{config.descricao}</p>

        {carregando && <Loading />}

        {!carregando && tipo === 'estoque' && (
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead>
                <tr><th>Código</th><th>Produto</th><th>Categoria</th><th className="text-center">Qtd</th><th className="text-center">Mín</th><th>Lote</th><th>Validade</th><th className="text-end">Valor venda</th></tr>
              </thead>
              <tbody>
                {dados?.map((p) => (
                  <tr key={p.codigo}>
                    <td>{p.codigo}</td>
                    <td>{p.nome}</td>
                    <td>{p.categoria ?? '—'}</td>
                    <td className="text-center">{p.quantidadeAtual}</td>
                    <td className="text-center">{p.quantidadeMinima}</td>
                    <td>{p.lote ?? '—'}</td>
                    <td>{p.dataValidade ? new Date(p.dataValidade).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="text-end">{formatarMoeda(p.valorVenda)}</td>
                  </tr>
                ))}
                {dados?.length === 0 && <tr><td colSpan={8}><EmptyState /></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && tipo === 'estoqueBaixo' && (
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead>
                <tr><th>Código</th><th>Produto</th><th>Categoria</th><th className="text-center">Qtd atual</th><th className="text-center">Mínimo</th><th>Validade</th></tr>
              </thead>
              <tbody>
                {dados?.map((p) => (
                  <tr key={p.codigo}>
                    <td>{p.codigo}</td>
                    <td>{p.nome}</td>
                    <td>{p.categoria ?? '—'}</td>
                    <td className="text-center"><span className="badge badge-baixo">{p.quantidadeAtual}</span></td>
                    <td className="text-center">{p.quantidadeMinima}</td>
                    <td>{p.situacaoValidade ?? 'Sem validade'}</td>
                  </tr>
                ))}
                {dados?.length === 0 && <tr><td colSpan={6}><EmptyState texto="Nenhum produto abaixo do estoque mínimo." /></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && tipo === 'validade' && dados && (
          <>
            {['vencidos', 'vencendo30d', 'validos'].map((grupo) => (
              <div key={grupo} className="mb-3">
                <h3 className="h6 fw-bold text-capitalize">{grupo === 'vencidos' ? 'Vencidos' : grupo === 'vencendo30d' ? 'Vencendo em 30 dias' : 'Dentro da validade'} ({dados[grupo].length})</h3>
                <table className="table table-sm table-striped">
                  <thead><tr><th>Código</th><th>Produto</th><th>Validade</th></tr></thead>
                  <tbody>
                    {dados[grupo].map((p) => (
                      <tr key={p.codigo}>
                        <td>{p.codigo}</td>
                        <td>{p.nome}</td>
                        <td>{p.dataValidade ? new Date(p.dataValidade).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                    {dados[grupo].length === 0 && <tr><td colSpan={3} className="text-muted small">Nenhum registro.</td></tr>}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}

        {!carregando && tipo === 'movimentacoes' && (
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Produto</th><th className="text-center">Qtd</th><th>Usuário</th><th>Motivo</th><th>Observação</th></tr>
              </thead>
              <tbody>
                {dados?.map((m, i) => (
                  <tr key={i}>
                    <td>{formatarDataHora(m.data)}</td>
                    <td>{m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}</td>
                    <td>{m.produto}</td>
                    <td className="text-center">{m.quantidade}</td>
                    <td>{m.usuario}</td>
                    <td>{m.motivo}</td>
                    <td className="small text-muted">{m.observacao ?? '—'}</td>
                  </tr>
                ))}
                {dados?.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
