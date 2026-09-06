# UniVet — Controle de Estoque de Medicamentos e Produtos Veterinários

Sistema web completo de **controle de estoque de medicamentos e produtos veterinários** para a Clínica Veterinária Fernanda Calixto. Desenvolvido como Projeto Integrador (PI), com **Frontend Web + Backend/API REST + PostgreSQL**, pronto para hospedagem no Render.

> Identidade visual herdada do projeto UniVet (cores, tipografia, logo e tela de login).

---

## Funcionalidades

- Cadastro, edição, consulta, pesquisa, filtros e inativação de **produtos**;
- Controle de **entradas** (soma ao estoque) e **saídas** (subtrai, sem permitir estoque negativo);
- Bloqueio de saída de produtos **vencidos** (exceto baixa por vencimento/perda/avaria);
- Controle de **categorias** e **fornecedores** (com produtos relacionados);
- Controle de **lotes e validade** com alertas: vencido 🔴, vencendo em até 30 dias 🟠, dentro da validade 🟢;
- Alerta de **estoque baixo** (`quantidadeAtual <= quantidadeMinima`) com notificações na topbar;
- **Dashboard** com cards e gráficos (entradas × saídas, produtos por categoria, valor do estoque);
- **Histórico de movimentações** com filtros (período, produto, tipo, usuário, motivo);
- **Relatórios** (estoque, estoque baixo, validade, movimentações) com exportação **CSV/PDF**;
- **Autenticação** segura (bcrypt + JWT) e **permissões** por perfil (ADMIN / FUNCIONARIO);
- **Soft delete** em registros com histórico;
- Interface responsiva (computador, tablet e celular) com React + Bootstrap.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, JavaScript, Bootstrap 5, React Router, Axios, Chart.js |
| Backend | Node.js, Express, JavaScript, API REST |
| Banco | PostgreSQL, Prisma ORM |
| Testes | Jest + Supertest (43 testes) |
| Deploy | Render (Blueprint) + GitHub |

## Estrutura de pastas

```
backend/
├── prisma/          # schema.prisma, migrations, seed.js
└── src/
    ├── controllers/ # Recebem as requisições e respondem HTTP
    ├── routes/      # Definição dos endpoints
    ├── services/    # Regras de negócio (transações, validações)
    ├── middlewares/ # auth JWT, permissões, errorHandler
    ├── validators/  # Validação com express-validator
    ├── utils/       # Apoio (cálculo de validade etc.)
    ├── config/      # env.js
    ├── app.js
    └── server.js

frontend/
└── src/
    ├── components/  # UI reutilizável
    ├── pages/       # Telas (Dashboard, Produtos, Entradas, ...)
    ├── layouts/     # Sidebar + Topbar
    ├── services/    # Axios (api.js)
    ├── contexts/    # AuthContext (JWT)
    └── App.jsx
```

## Como rodar localmente

### Pré-requisitos

- Node.js LTS (v18+)
- PostgreSQL (porta 5432)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # ajuste DATABASE_URL/JWT_SECRET se necessário
npx prisma migrate dev      # cria as tabelas
npm run prisma:seed         # popula dados de demonstração
npm run dev                 # API em http://localhost:3333
```

### 2. Frontend

```bash
cd frontend
npm install
# (opcional) crie frontend/.env com VITE_API_URL=http://localhost:3333/api
npm run dev                 # site em http://localhost:5173
```

### Credenciais de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@clinica.com` | `admin123` |
| Funcionário | `funcionario@clinica.com` | `func123` |

### Testes

```bash
cd backend
npm test
```

Os testes usam o banco `estoque_veterinario_test` (criado e migrado automaticamente pelo Jest).

## Variáveis de ambiente (backend)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Segredo para assinar os tokens |
| `JWT_EXPIRES_IN` | Expiração do token (padrão `8h`) |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula (padrão localhost:5173) |
| `SEED_ON_START` | `true` popula o banco automaticamente se estiver vazio (produção) |

Frontend: `VITE_API_URL` aponta para a URL da API (ex.: `https://univet-backend.onrender.com/api`).

## Endpoints da API

```
POST   /api/auth/login        → JWT
GET    /api/auth/me           → usuário logado

GET    /api/produtos          → listar (search, categoria, fornecedor, status, validade, page)
POST   /api/produtos          → cadastrar
GET    /api/produtos/:id      → detalhe
PUT    /api/produtos/:id      → editar
DELETE /api/produtos/:id      → inativar (soft delete)

GET/POST /api/categorias      PUT/DELETE /api/categorias/:id
GET/POST /api/fornecedores    PUT/DELETE /api/fornecedores/:id

GET/POST /api/entradas        GET /api/entradas/:id
GET/POST /api/saidas          GET /api/saidas/:id

GET    /api/movimentacoes     → histórico (periodo, produto, tipo, usuario, motivo)
GET    /api/dashboard         → cards + dados para gráficos
GET    /api/alertas           → estoque baixo / vencidos / vencendo 30d

GET    /api/relatorios/estoque | estoque-baixo | validade | movimentacoes
       → suporta ?formato=csv (e PDF/CSV pelo frontend)

GET    /api/health            → health check
```

## Regras de negócio implementadas

1. Quantidade nunca negativa;
2. Saída maior que o estoque é bloqueada (HTTP 400);
3. Entrada soma ao estoque; 4. Saída subtrai (via transação Prisma);
5. Toda movimentação gera histórico; 6. `usuarioId` registrado em todas as movimentações;
7–9. Alertas de estoque baixo, vencidos e vencendo ≤ 30 dias;
10. Produtos inativos não aparecem para novas movimentações;
11. Soft delete em registros com histórico; 12. Validação no frontend e no backend.

## Deploy no Render

O repositório contém `render.yaml` (Blueprint), que cria o banco PostgreSQL, o backend e o frontend em um clique:

1. Publique este repositório no GitHub;
2. Acesse [render.com](https://render.com) → **New → Blueprint**;
3. Selecione o repositório e clique em **Apply**;
4. O Render cria `univet-db` (PostgreSQL), `univet-backend` (API) e `univet-frontend` (site estático);
5. `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN` são configurados automaticamente;
6. Na primeira subida, o backend executa as migrations e popula o seed automaticamente (`SEED_ON_START=true`).

> Observações do plano gratuito: o serviço "dorme" após ~15 min sem acesso (primeira visita pode demorar ~1 min) e bancos gratuitos expiram após 30 dias.

## Git e GitHub

- Commits convencionais (`feat:`, `fix:`, `test:`, `docs:`);
- `.gitignore` exclui `node_modules`, `dist/`, `.env` (exceto `.env.example`);
- Nenhuma credencial real é versionada.
