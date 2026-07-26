# Controle de Estoque — Back-end (API v2.0.0)

Back-end oficial do projeto [`controle-estoque`](https://github.com/Luizbr5/controle-estoque).

Implementado **exatamente** conforme o contrato documentado no front-end (`src/types/api.ts`,
`src/services/*.service.ts` e `src/services/mock-db.ts`, todos comentados como fonte oficial da
API v2.0.0). Nenhum nome de rota, payload, resposta JSON, código HTTP ou regra de negócio foi
alterado em relação ao que está documentado naqueles arquivos.

## Stack

Node.js · TypeScript (strict) · Express · Prisma ORM · PostgreSQL · Docker · JWT · bcrypt · Zod ·
Swagger (OpenAPI) · dotenv · ESLint · Prettier

## Arquitetura

```
src/
  config/        env, logger, prisma client, swagger
  controllers/   camada HTTP (request/response)
  middlewares/   auth (JWT), validação (Zod), upload, erros
  repositories/  acesso a dados via Prisma Client (Repository Pattern)
  routes/        definição das rotas + anotações Swagger
  schemas/       validação Zod dos DTOs de entrada
  services/      regras de negócio (Service Layer) + mapeamento para DTOs
  types/         tipos espelhando o contrato oficial da API
  utils/         ApiError, helpers de resposta, paginação
prisma/
  schema.prisma  modelo de dados
  seed.ts        dados de exemplo (mesmo dataset do mock do front-end)
```

## Como rodar

### Com Docker (recomendado)

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed   # opcional: popula dados de exemplo
```

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api-docs`
- Adminer (admin do PostgreSQL): `http://localhost:8080` (sistema: PostgreSQL, servidor: `postgres`, usuário/senha: `postgres`)

### Localmente (sem Docker)

```bash
cp .env.example .env   # ajuste DATABASE_URL para seu PostgreSQL local
npm install
npm run prisma:migrate
npm run seed            # opcional
npm run dev
```

Usuário de teste criado pelo seed: `maria@empresa.com` / `senha123`.

## Endpoints (todos sob `/api/v1`, documentados em `/api-docs`)

| Método | Rota                     | Auth | Descrição                                  |
|--------|--------------------------|------|---------------------------------------------|
| POST   | `/auth/register`         | -    | Cria usuário e retorna token                |
| POST   | `/auth/login`            | -    | Autentica e retorna token                   |
| GET    | `/auth/me`               | ✔    | Dados do usuário autenticado                |
| GET    | `/categories`            | ✔    | Lista categorias                            |
| GET    | `/categories/:id`        | ✔    | Busca categoria por ID                      |
| POST   | `/categories`            | ✔    | Cria categoria                              |
| PUT    | `/categories/:id`        | ✔    | Atualiza categoria                          |
| DELETE | `/categories/:id`        | ✔    | Remove categoria                            |
| GET    | `/products`              | ✔    | Lista produtos (filtros/ordenação/paginação)|
| GET    | `/products/:id`          | ✔    | Busca produto por ID                        |
| POST   | `/products`              | ✔    | Cria produto                                |
| PUT    | `/products/:id`          | ✔    | Atualiza produto                            |
| DELETE | `/products/:id`          | ✔    | Remove (inativa) produto                    |
| POST   | `/products/:id/image`    | ✔    | Upload de imagem do produto                 |
| GET    | `/stock-movements`       | ✔    | Lista movimentações de estoque              |
| POST   | `/stock-movements`       | ✔    | Registra movimentação (IN/OUT/ADJUSTMENT)   |
| GET    | `/dashboard/summary`     | ✔    | Resumo geral do estoque                     |
| GET    | `/dashboard/low-stock`   | ✔    | Produtos com estoque baixo                  |
| GET    | `/dashboard/recent-movements` | ✔ | Últimas 10 movimentações               |

Todas as respostas seguem o envelope oficial:

```json
// Sucesso (item único)
{ "success": true, "data": { ... }, "message": "opcional" }

// Sucesso (lista)
{ "success": true, "data": [ ... ], "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 } }

// Sucesso sem corpo (ex.: DELETE)
{ "success": true, "message": "..." }

// Erro
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "details": {} } }
```

### Códigos de erro

`VALIDATION_ERROR` (400) · `UNAUTHORIZED` (401) · `TOKEN_EXPIRED` (401) · `FORBIDDEN` (403) ·
`NOT_FOUND` (404) · `DUPLICATE_ENTRY` (409) · `INSUFFICIENT_STOCK` (422) · `INTERNAL_ERROR` (500)

## Regras de negócio implementadas (espelhando o contrato)

- Categoria: nome único (case-insensitive); exclusão é definitiva.
- Produto: SKU único (quando informado); exclusão é lógica (`is_active = false`);
  `low_stock = quantity <= min_quantity` (sempre recalculado); ao criar um produto com
  `quantity > 0`, é gerada automaticamente uma movimentação `IN` com motivo "Estoque inicial".
- Movimentação de estoque: `IN` soma, `OUT` subtrai (erro `INSUFFICIENT_STOCK` se exceder o
  saldo), `ADJUSTMENT` define a quantidade absoluta; só é permitida em produtos ativos.
- Listagem de produtos: filtro `is_active` padrão `true`; busca por `name`/`sku`; paginação
  com `limit` máximo de 100.

## Integração com o front-end

No front-end, configure `VITE_API_URL=http://localhost:3001/api/v1` e altere
`USE_MOCK` para `false` em `src/services/api.ts` — nenhuma outra mudança é necessária, pois
todos os payloads e respostas desta API seguem exatamente o contrato consumido pelos serviços
existentes.
