# 📦 StockControl - Sistema de Controle de Estoque Multi-tenant

Sistema completo de gerenciamento de estoque com isolamento multi-tenant, segurança avançada e performance otimizada.

## ✨ Features

- ✅ **Multi-tenant**: Isolamento completo de dados por empresa
- ✅ **Autenticação JWT**: Login seguro com token
- ✅ **Dashboard**: Resumo visual do estoque
- ✅ **Produtos**: CRUD completo com SKU e preços
- ✅ **Categorias**: Organização de produtos
- ✅ **Movimentações**: Histórico de entradas e saídas
- ✅ **Dark Mode**: Tema claro/escuro
- ✅ **Segurança**: Helmet, CORS, Rate Limiting
- ✅ **Performance**: Cache, Índices, Compressão Gzip
- ✅ **Monitoramento**: Integração com Sentry

## 🚀 Quick Start

### Credenciais Teste

Para criar credenciais de teste:

1. Acesse http://localhost:5173
2. Clique em "Criar Conta"
3. Preencha com dados fictícios:
   - Nome: Seu Nome
   - Email: seu-email@teste.com
   - Senha: Uma senha forte
   - Empresa: Minha Empresa Teste

**Não compartilhe suas credenciais! Use apenas em desenvolvimento.**

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

### URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api-docs

## 📋 Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- JWT + Bcrypt
- Helmet + CORS
- Sentry (monitoramento)

### Frontend
- React + TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- React Query
- Sonner (toasts)

## 🔒 Segurança

- Helmet para headers HTTP seguros
- CORS com whitelist de origem
- Rate Limiting (100 req/15min geral, 5 tentativas login)
- JWT com expiração
- Bcrypt para senhas
- Validação com Zod
- SQL Injection protection (Prisma)

## ⚡ Performance

- Cache em memória (5 min)
- Compressão Gzip
- 8 índices no banco de dados
- Paginação de dados
- 50 req/s testado

## 📁 Estrutura
.
├── backend/
│   ├── src/
│   │   ├── config/      # Configurações
│   │   ├── controllers/ # Rotas
│   │   ├── services/    # Lógica de negócio
│   │   ├── repositories/# Acesso ao banco
│   │   ├── middlewares/ # Auth, validação
│   │   └── types/       # TypeScript types
│   └── prisma/          # Schema e migrations
│
└── frontend/
├── src/
│   ├── components/  # Componentes React
│   ├── pages/       # Páginas
│   ├── services/    # API client
│   ├── contexts/    # Context API
│   └── utils/       # Utilitários
└── public/          # Assets estáticos

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📝 Variáveis de Ambiente

### Backend (`.env`)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/controle_estoque
JWT_SECRET=sua-chave-secreta-aqui
SENTRY_DSN=https://xxx@sentry.io/xxx

### Frontend (`.env`)
VITE_API_URL=http://localhost:3001/api/v1

## 🐳 Docker (Opcional)

```bash
docker-compose up -d
```

## 📞 Suporte

Para dúvidas ou bugs, abra uma issue no GitHub.

## 📄 Licença

MIT