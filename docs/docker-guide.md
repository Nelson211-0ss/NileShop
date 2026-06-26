# Docker Guide

## Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| nginx | nileshop-nginx | 80 | Reverse proxy |
| laravel | nileshop-laravel | 9000 (internal) | PHP-FPM API |
| react | nileshop-react | 5173 | Vite dev server |
| horizon | nileshop-horizon | — | Queue worker |
| scheduler | nileshop-scheduler | — | Cron scheduler |
| postgres | nileshop-postgres | 5432 | Database |
| redis | nileshop-redis | 6379 | Cache & queues |
| meilisearch | nileshop-meilisearch | 7700 | Search |
| minio | nileshop-minio | 9000, 9001 | Object storage |
| mailpit | nileshop-mailpit | 1025, 8025 | Email testing |

## Commands

```bash
# Start
docker compose up -d

# Rebuild after Dockerfile changes
docker compose up -d --build

# View logs
docker compose logs -f laravel

# Run migrations
docker compose exec laravel php artisan migrate --seed

# Run tests
docker compose exec laravel php artisan test

# Artisan
docker compose exec laravel php artisan <command>

# Stop and remove
docker compose down

# Stop and remove volumes (destructive)
docker compose down -v
```

## MinIO Setup

1. Open http://localhost:9001
2. Login with credentials from `.env` (`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`)
3. Create bucket `nileshop`

## Production Notes

- Use separate compose override for production
- Replace MinIO with AWS S3 (remove `AWS_ENDPOINT`)
- Use managed PostgreSQL and Redis
- Set `APP_DEBUG=false`
- Configure SSL termination at nginx/load balancer
