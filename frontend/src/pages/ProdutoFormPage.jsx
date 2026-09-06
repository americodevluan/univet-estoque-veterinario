import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { extrairErro } from '../services/api';
import { Loading, formatarMoeda } from '../components/ui';

const INICIAL = {
  nome: '',
  codigo: '',
  categoriaId: '',
  fornecedorId: '',
  descricao: '',
  unidadeMedida: 'un',
  quantidadeAtual: 0,
  quantidadeMinima: 0,
  valorCompra: '',
  valorVenda: '',
  lote: '',
  dataValidade: '',
  ativo: true,
};

export default function ProdutoFormPage() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(INICIAL);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(edicao);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    Promise.all([api.get('/categorias'), api.get('/fornecedores')])
      .then(([c, f]) => {
        setCategorias(c.data);
        setFornecedores(f.data);
      })
      .catch((err) => setErroGeral(extrairErro(err)));

    if (edicao) {
      api
        .get(`/produtos/${id}`)
        .then((r) => {
          const p = r.data;
          setForm({
            nome: p.nome,
            codigo: p.codigo,
            categoriaId: p.categoriaId ?? '',
            fornecedorId: p.fornecedorId ?? '',
            descricao: p.descricao ?? '',
            unidadeMedida: p.unidadeMedida,
            quantidadeAtual: p.quantidadeAtual,
            quantidadeMinima: p.quantidadeMinima,
            valorCompra: p.valorCompra,
            valorVenda: p.valorVenda,
            lote: p.lote ?? '',
            dataValidade: p.dataValidade ? p.dataValidade.slice(0, 10) : '',
            ativo: p.ativo,
          });
        })
        .catch((err) => setErroGeral(extrairErro(err)))
        .finally(() => setCarregando(false));
    }
  }, [edicao, id]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  // Validações no frontend (espelhadas nas do backend)
  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'O nome do produto é obrigatório.';
    if (!form.codigo.trim()) e.codigo = 'O código do produto é obrigatório.';
    if (!form.categoriaId) e.categoriaId = 'Selecione uma categoria.';
    if (Number(form.quantidadeMinima) < 0) e.quantidadeMinima = 'A quantidade mínima não pode ser negativa.';
    if (form.valorCompra !== '' && Number(form.valorCompra) < 0) e.valorCompra = 'O valor de compra não pode ser negativo.';
    if (form.valorVenda !== '' && Number(form.valorVenda) < 0) e.valorVenda = 'O valor de venda não pode ser negativo.';
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const e2 = validar();
    setErros(e2);
    if (Object.keys(e2).length > 0) return;

    setEnviando(true);
    setErroGeral('');
    try {
      const body = {
        nome: form.nome.trim(),
        codigo: form.codigo.trim(),
        categoriaId: Number(form.categoriaId),
        fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : null,
        descricao: form.descricao || null,
        unidadeMedida: form.unidadeMedida || 'un',
        quantidadeMinima: Number(form.quantidadeMinima) || 0,
        valorCompra: form.valorCompra === '' ? 0 : Number(form.valorCompra),
        valorVenda: form.valorVenda === '' ? 0 : Number(form.valorVenda),
        lote: form.lote || null,
        dataValidade: form.dataValidade || null,
      };
      if (edicao) {
        body.ativo = form.ativo;
        await api.put(`/produtos/${id}`, body);
      } else {
        body.quantidadeAtual = Number(form.quantidadeAtual) || 0;
        await api.post('/produtos', body);
      }
      navigate('/produtos');
    } catch (err) {
      setErroGeral(extrairErro(err));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <Loading />;

  return (
    <div className="card p-4 mx-auto" style={{ maxWidth: 860 }}>
      <h1 className="page-title h3 mb-1">{edicao ? 'Editar produto' : 'Novo produto'}</h1>
      <p className="text-muted small mb-4">Preencha os dados do produto. Campos com * são obrigatórios.</p>

      {erroGeral && <div className="alert alert-danger py-2 small">{erroGeral}</div>}

      <form onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Nome do produto *</label>
            <input className={`form-control ${erros.nome ? 'is-invalid' : ''}`} value={form.nome} onChange={(e) => set('nome', e.target.value)} />
            {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label">Código *</label>
            <input className={`form-control ${erros.codigo ? 'is-invalid' : ''}`} value={form.codigo} onChange={(e) => set('codigo', e.target.value)} />
            {erros.codigo && <div className="invalid-feedback">{erros.codigo}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Categoria *</label>
            <select className={`form-select ${erros.categoriaId ? 'is-invalid' : ''}`} value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {erros.categoriaId && <div className="invalid-feedback">{erros.categoriaId}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Fornecedor</label>
            <select className="form-select" value={form.fornecedorId} onChange={(e) => set('fornecedorId', e.target.value)}>
              <option value="">Nenhum</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Descrição</label>
            <textarea className="form-control" rows="2" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Unidade de medida</label>
            <input className="form-control" value={form.unidadeMedida} onChange={(e) => set('unidadeMedida', e.target.value)} placeholder="un, ml, frasco..." />
          </div>
          {!edicao && (
            <div className="col-md-3">
              <label className="form-label">Quantidade inicial</label>
              <input type="number" min="0" className="form-control" value={form.quantidadeAtual} onChange={(e) => set('quantidadeAtual', e.target.value)} />
            </div>
          )}
          <div className="col-md-3">
            <label className="form-label">Quantidade mínima</label>
            <input type="number" min="0" className={`form-control ${erros.quantidadeMinima ? 'is-invalid' : ''}`} value={form.quantidadeMinima} onChange={(e) => set('quantidadeMinima', e.target.value)} />
            {erros.quantidadeMinima && <div className="invalid-feedback">{erros.quantidadeMinima}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">Lote</label>
            <input className="form-control" value={form.lote} onChange={(e) => set('lote', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Valor de compra (R$)</label>
            <input type="number" step="0.01" min="0" className={`form-control ${erros.valorCompra ? 'is-invalid' : ''}`} value={form.valorCompra} onChange={(e) => set('valorCompra', e.target.value)} />
            {erros.valorCompra && <div className="invalid-feedback">{erros.valorCompra}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Valor de venda (R$)</label>
            <input type="number" step="0.01" min="0" className={`form-control ${erros.valorVenda ? 'is-invalid' : ''}`} value={form.valorVenda} onChange={(e) => set('valorVenda', e.target.value)} />
            {erros.valorVenda && <div className="invalid-feedback">{erros.valorVenda}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Data de validade</label>
            <input type="date" className="form-control" value={form.dataValidade} onChange={(e) => set('dataValidade', e.target.value)} />
          </div>

          {edicao && (
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} />
                <label className="form-check-label" htmlFor="ativo">Produto ativo</label>
              </div>
              <div className="alert alert-light border py-2 mt-2 small mb-0">
                Estoque atual: <strong>{form.quantidadeAtual}</strong> — o estoque só é alterado por entradas e saídas.
              </div>
            </div>
          )}
        </div>

        <div className="d-flex gap-2 justify-content-end mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/produtos')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : edicao ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
