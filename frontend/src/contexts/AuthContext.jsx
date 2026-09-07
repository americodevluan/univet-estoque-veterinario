import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function lerUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
}

// Retorna true se o token JWT já expirou (payload.exp em segundos)
function tokenExpirado(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioLocal);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    sessionStorage.removeItem('sessaoExpirada');
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  // Token expirado no carregamento: encerra a sessão imediatamente.
  useEffect(() => {
    if (token && tokenExpirado(token)) {
      sessionStorage.setItem('sessaoExpirada', '1');
      logout();
    }
  }, [token, logout]);

  // Evento disparado pelo interceptor da API ao receber 401 (token expirado).
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [logout]);

  const value = {
    usuario,
    token,
    login,
    logout,
    isAdmin: usuario?.perfil === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
