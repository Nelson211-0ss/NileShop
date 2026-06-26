# NileShop Architecture

## Overview

NileShop follows **Clean Architecture** with a **feature-based** module structure. Each domain module is independent and communicates through well-defined service boundaries.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  React Web │ React Native │ Admin Dashboard (future)        │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (v1)
┌─────────────────────────┴───────────────────────────────────┐
│                     API Layer (Laravel)                      │
│  Controllers → Form Requests → API Resources → Policies      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                   Application Layer                          │
│  Services │ DTOs │ Events │ Notifications │ Jobs             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Domain Layer                              │
│  Models │ Enums │ Repository Contracts                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                 Infrastructure Layer                         │
│  PostgreSQL │ Redis │ Meilisearch │ S3/MinIO │ Mail/SMS      │
└─────────────────────────────────────────────────────────────┘
```

## Backend Module Structure

```
backend/app/Features/{Module}/
├── DTOs/
├── Repositories/
│   └── Contracts/
├── Services/
└── Events/ (as needed)

backend/app/Http/
├── Controllers/Api/V1/{Module}/
├── Requests/Api/V1/{Module}/
└── Resources/Api/V1/
```

## User Roles

| Role | Guard | Description |
|------|-------|-------------|
| `customer` | web | Shop, checkout, track orders |
| `vendor` | web | Manage store and products |
| `delivery_rider` | web | Deliver orders, GPS tracking |
| `administrator` | web | Full platform management |

RBAC implemented via **Spatie Laravel Permission** with granular permissions.

## API Conventions

- Base URL: `/api/v1`
- Authentication: Bearer token (Sanctum)
- Response format: `{ success, message?, data?, errors?, meta? }`
- Pagination: `{ data, meta: { current_page, per_page, total } }`
- Versioning: URL prefix (`/api/v1`, future `/api/v2`)

## Security

- CSRF: Sanctum stateful domains for SPA
- Rate limiting: 60 req/min default API throttle
- Password hashing: bcrypt (12 rounds)
- RBAC: Spatie permissions + Laravel policies
- Audit logs: `audit_logs` table for model changes
- Activity logs: `activity_logs` for user actions

## Currencies & Locales

- Currencies: SSP (default), USD
- Locales: English (en), Arabic (ar)
- Timezone default: Africa/Juba
