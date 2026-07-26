# 🚀 DevOps & Backup

## Backup Automático

### Executar backup manual:
```bash
bash backend/scripts/backup.sh
```

### Agendar backup automático (Linux/Mac):
```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 2AM)
0 2 * * * cd /path/to/projeto && bash backend/scripts/backup.sh
```

### Backups salvos em:
