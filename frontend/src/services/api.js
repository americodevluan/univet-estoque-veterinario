import axios from 'axios';

// Instância do Axios configurada com a URL da API e o token JWT
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Extrai mensagem amigável de erro da resposta
export function extrairErro(err) {
  const dados = err?.response?.data;
  if (dados?.message) {
    if (dados.errors?.length) {
      return `${dados.message} ${dados.errors.map((e) => e.mensagem).join(' · ')}`;
    }
    return dados.message;
  }
  return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
}

export default api;
