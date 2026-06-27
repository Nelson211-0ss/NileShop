# NileShop

Multi-vendor e-commerce marketplace for South Sudan. All prices are in **SSP** (South Sudanese Pound).

## Quick start (Docker)

### First-time setup (after clone)

Run these in order on a fresh clone:

```bash
# 1. Environment files (not in git)
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Start the full stack
docker compose up -d

# 3. Install PHP dependencies (required — backend/vendor is gitignored)
docker compose exec laravel composer install

# 4. Generate application key
docker compose exec laravel php artisan key:generate

# 5. Create and seed the database
docker compose exec laravel php artisan migrate --seed --force

# 6. Build and start the frontend
docker compose build react && docker compose up -d react

# 7. Refresh product images (after storage is ready)
docker compose exec laravel php artisan marketplace:refresh-product-images
```

Open **http://localhost:8888** (default `NGINX_PORT` in `.env`).

### Day-to-day commands

```bash
docker compose up -d                                              # Start all services
docker compose exec laravel php artisan migrate --seed --force   # Reset database
docker compose exec laravel php artisan marketplace:refresh-product-images
docker compose build react && docker compose up -d react         # Rebuild frontend after UI changes
```

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
