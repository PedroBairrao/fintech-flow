# FinTech Flow – Sistema de Tesouraria Integrada

Core Engine de gestão de fluxo de caixa da **SafeCash**: API REST (Node.js/Express/SQLite) + interface administrativa (React/Vite).

## Funcionalidades
- Login/cadastro com **JWT** e **RBAC** (`admin` / `user`)
- CRUD de transações com **validação (Zod)**: valores > 0, data AAAA-MM-DD, bloqueio de duplicidade
- **Soft delete** (somente admin): nada é removido fisicamente; guarda `created_by/at`, `updated_by/at`, `deleted_by/at`
- Dashboard com saldo em tempo real, entradas, saídas e gráficos
- Filtros, busca e paginação; toasts, loaders e modais de confirmação
- Documentação Swagger em `/api/docs`

## Rodando localmente
```bash
# Backend
cd backend && cp .env.example .env && npm install && npm start   # http://localhost:3333
npm test                                                          # testes automatizados

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```
Login inicial: `admin@fintechflow.com` / `admin123` (altere em `.env`).

## Rotas da API
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Cadastro e login (retorna JWT) |
| GET | `/api/transactions?search&type&category&page&limit` | Listar |
| GET | `/api/transactions/:id` | Detalhe |
| POST | `/api/transactions` | Criar |
| PUT | `/api/transactions/:id` | Editar |
| DELETE | `/api/transactions/:id` | Soft delete (admin) |
| GET | `/api/dashboard` | Saldo e agregações |

Todas as rotas (exceto auth) exigem `Authorization: Bearer <token>`.

## Deploy
**Frontend (Vercel/Netlify):** raiz do projeto = `frontend`, build `npm run build`, saída `dist`, variável `VITE_API_URL` = URL pública da API. (`vercel.json` e `netlify.toml` já incluídos.)

**Backend:** hospedar em Render/Railway/Fly (Node, `npm start`) com variáveis `JWT_SECRET`, `CORS_ORIGIN` (URL do frontend), `ADMIN_PASSWORD`. Obs.: SQLite precisa de disco persistente; em planos gratuitos sem disco os dados são resetados a cada deploy.

## Documentação do projeto
- [`docs/REQUISITOS.md`](docs/REQUISITOS.md) – requisitos, RBAC e estratégia de testes
- [`docs/TRELLO.md`](docs/TRELLO.md) – quadro de tarefas por etapa
- [`docs/STACK.md`](docs/STACK.md) – justificativa da stack
- Vídeo de demonstração: adicionar em `docs/demo.mp4` (Etapa 11)
