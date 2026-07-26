# 🔧 Guia de Configuração Local

## Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org))
- PostgreSQL 14+ ([Download](https://postgresql.org))
- Git

## Passo 1: Clonar Repositório

```bash
git clone https://github.com/seu-usuario/controle-estoque.git
cd controle-estoque
```

## Passo 2: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Editar .env com suas credenciais
nano .env

# Criar banco de dados
createdb controle_estoque

# Rodar migrations
npx prisma migrate dev --name init

# Seed (dados de teste)
npx prisma db seed

# Iniciar servidor
npm run dev
```

**Backend está rodando em:** `http://localhost:3001`

## Passo 3: Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Editar .env se necessário
nano .env

# Iniciar dev server
npm run dev
```

**Frontend está rodando em:** `http://localhost:5173`

## Passo 4: Acessar Aplicação

1. Abra http://localhost:5173
2. Clique em "Criar Conta" para registrar sua primeira conta
3. Use credenciais que você criou

**Nota:** Não compartilhe credenciais em repositórios públicos!

## 🧹 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
psql --version

# Criar banco manualmente
createdb controle_estoque

# Rodar migrations
npx prisma migrate deploy
```

### Porta já em uso
```bash
# Matar processo na porta 3001
lsof -i :3001
kill -9 <PID>

# Ou usar outra porta
PORT=3002 npm run dev
```

### Módulos não encontrados
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

## 📚 Próximas Etapas

- Ler [API.md](./API.md) para entender os endpoints
- Ler [CONTRIBUTING.md](./CONTRIBUTING.md) para contribuir
