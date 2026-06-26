# NileShop

Multi-vendor e-commerce marketplace for South Sudan. All prices are in **SSP** (South Sudanese Pound).

## Quick start (Docker)

```bash
# Start the full stack
docker compose up -d

# First-time setup (or reset database)
docker compose exec laravel php artisan migrate --seed --force

# Fix or refresh product images (after storage setup)
docker compose exec laravel php artisan marketplace:refresh-product-images

# Rebuild frontend after UI changes
docker compose build react && docker compose up -d react
```

Open **http://localhost:8888** (default `NGINX_PORT` in `.env`).

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nileshop.ss` | `password` |
| Customer | `customer@nileshop.ss` | `password` |
| Vendor | `vendor1@nileshop.ss` | `password` |
| Rider | `rider@nileshop.ss` | `password` |

## Local frontend dev (hot reload)

Run the API in Docker, then start Vite on your machine:

```bash
npm run dev:web:local
```

Open the URL Vite prints (often `http://localhost:5173`). API requests proxy to `http://localhost:8888`.

## Useful commands

```bash
npm run dev:web:local    # Vite dev server with hot reload
npm run build:web        # Production frontend build
docker compose logs -f   # Follow container logs
docker compose down      # Stop all services
```

## Project structure

| Path | Description |
|------|-------------|
| `apps/web/` | React storefront |
| `apps/mobile/customer/` | Expo customer app |
| `backend/` | Laravel 12 API |
| `packages/types/` | Shared TypeScript types |
| `packages/utils/` | Shared utilities (`formatCurrency`, etc.) |
| `docs/` | Architecture and API docs |

See [docs/docker-guide.md](docs/docker-guide.md) for service ports and production notes.
