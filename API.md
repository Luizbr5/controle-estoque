# 📚 Documentação da API

Base URL: `http://localhost:3001/api/v1`

## Autenticação

Todas as requisições (exceto login) requerem header:
Authorization: Bearer <seu_token_jwt>

## Endpoints

### Auth

#### POST `/auth/register`
Criar nova conta e empresa

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123",
  "company_name": "Minha Empresa"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "company_id": "uuid",
      "company_name": "Minha Empresa",
      "role": "OWNER"
    },
    "token": "eyJhbGc..."
  }
}
```

#### POST `/auth/login`
Fazer login

**Request:**
```json
{
  "email": "joao@empresa.com",
  "password": "senha123"
}
```

---

### Produtos

#### GET `/products`
Listar produtos

**Query Params:**
- `page` (número)
- `limit` (número)
- `search` (string)
- `category_id` (uuid)
- `low_stock` (boolean)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Produto A",
      "sku": "SKU-001",
      "price": 99.90,
      "quantity": 50,
      "min_quantity": 10,
      "category": {"id": "uuid", "name": "Eletrônicos"},
      "is_active": true,
      "low_stock": false
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### POST `/products`
Criar produto

#### PUT `/products/:id`
Atualizar produto

#### DELETE `/products/:id`
Deletar produto (soft delete)

---

### Categorias

#### GET `/categories`
Listar categorias

#### POST `/categories`
Criar categoria

#### PUT `/categories/:id`
Atualizar categoria

#### DELETE `/categories/:id`
Deletar categoria

---

### Movimentações

#### GET `/stock-movements`
Listar movimentações

#### POST `/stock-movements`
Criar movimentação

---

### Dashboard

#### GET `/dashboard/summary`
Resumo do estoque

**Response:**
```json
{
  "total_products": 50,
  "active_products": 48,
  "low_stock_count": 5,
  "out_of_stock_count": 2,
  "total_categories": 10,
  "total_stock_value": 15000.00,
  "movements_today": 10,
  "movements_this_month": 250
}
```

---

## Status Codes

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já existe) |
| 500 | Erro interno |

## Rate Limiting

- 100 requisições por 15 minutos (geral)
- 5 tentativas de login por 15 minutos

## Swagger

Documentação interativa disponível em:
`http://localhost:3001/api-docs`
