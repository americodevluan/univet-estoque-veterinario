import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';
import ProdutoFormPage from './pages/ProdutoFormPage';
import CategoriasPage from './pages/CategoriasPage';
import FornecedoresPage from './pages/FornecedoresPage';
import EntradasPage from './pages/EntradasPage';
import SaidasPage from './pages/SaidasPage';
import MovimentacoesPage from './pages/MovimentacoesPage';
import RelatoriosPage from './pages/RelatoriosPage';
import UsuariosPage from './pages/UsuariosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="produtos/novo" element={<ProdutoFormPage />} />
          <Route path="produtos/:id/editar" element={<ProdutoFormPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="fornecedores" element={<FornecedoresPage />} />
          <Route path="entradas" element={<EntradasPage />} />
          <Route path="saidas" element={<SaidasPage />} />
          <Route path="movimentacoes" element={<MovimentacoesPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route
            path="usuarios"
            element={
              <RequireAdmin>
                <UsuariosPage />
              </RequireAdmin>
            }
          />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
