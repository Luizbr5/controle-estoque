#!/bin/bash

set -e

# Carregar variáveis do .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando backup do banco de dados..."
echo "📁 Arquivo: $BACKUP_FILE"

# Remover ?schema=public do DATABASE_URL
DB_URL="${DATABASE_URL%\?*}"

if [ -z "$DB_URL" ]; then
  echo "❌ DATABASE_URL não está configurada!"
  exit 1
fi

echo "🔗 Conectando ao banco..."

# Fazer backup
if pg_dump "$DB_URL" > "$BACKUP_FILE" 2>/dev/null; then
  gzip "$BACKUP_FILE"
  BACKUP_FILE="$BACKUP_FILE.gz"
  echo "✅ Backup concluído: $BACKUP_FILE"
  
  # Limpar backups antigos
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
  echo "✨ Backup finalizado!"
else
  echo "❌ Erro ao fazer backup (PostgreSQL não está rodando?)"
  rm -f "$BACKUP_FILE"
  exit 1
fi

