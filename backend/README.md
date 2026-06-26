# NileShop API (Laravel 12)

Backend API for the NileShop marketplace. Currency is **SSP** (South Sudanese Pound) throughout.

## Docker

```bash
# From repo root
docker compose up -d
docker compose exec laravel php artisan migrate --seed --force
```

API base URL (via nginx): `http://localhost:8888/api/v1`

## Local frontend dev

With Docker running the API:

```bash
npm run dev:web:local
```

## Artisan

```bash
docker compose exec laravel php artisan test
docker compose exec laravel php artisan horizon:status
docker compose exec laravel php artisan queue:work
```

## Test accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nileshop.ss` | `password` |
| Customer | `customer@nileshop.ss` | `password` |
| Vendor | `vendor1@nileshop.ss` | `password` |
| Rider | `rider@nileshop.ss` | `password` |
