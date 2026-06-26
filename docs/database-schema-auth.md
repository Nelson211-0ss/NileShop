# Database Schema — Authentication Module

## ER Diagram

```mermaid
erDiagram
    users ||--o{ oauth_providers : has
    users ||--o{ personal_access_tokens : has
    users ||--o{ activity_logs : generates
    users ||--o{ audit_logs : generates
    users }o--o{ roles : has
    roles }o--o{ permissions : has
    otp_codes }o--|| users : "identifier ref"

    users {
        bigint id PK
        uuid uuid UK
        string name
        string email UK
        timestamp email_verified_at
        string phone UK
        timestamp phone_verified_at
        string password
        string avatar
        string locale
        string currency
        string timezone
        boolean is_active
        boolean two_factor_enabled
        timestamp last_login_at
        timestamps created_at updated_at
        timestamp deleted_at
    }

    roles {
        bigint id PK
        string name UK
        string guard_name
    }

    permissions {
        bigint id PK
        string name UK
        string guard_name
    }

    oauth_providers {
        bigint id PK
        bigint user_id FK
        string provider
        string provider_id
        string provider_email
    }

    otp_codes {
        bigint id PK
        string identifier
        string purpose
        string code_hash
        tinyint attempts
        timestamp expires_at
        timestamp verified_at
    }

    activity_logs {
        bigint id PK
        bigint user_id FK
        string action
        string subject_type
        bigint subject_id
        json properties
    }

    audit_logs {
        bigint id PK
        bigint user_id FK
        string event
        string auditable_type
        bigint auditable_id
        json old_values
        json new_values
    }
```

## Tables

### `users`

Core user account. Supports customers, vendors, riders, and admins via role assignment.

| Column | Type | Notes |
|--------|------|-------|
| uuid | UUID | Public identifier for API |
| phone | VARCHAR(20) | Nullable, unique — South Sudan format +211... |
| locale | VARCHAR(5) | `en` or `ar` |
| currency | VARCHAR(3) | `SSP` or `USD` |
| timezone | VARCHAR | Default `Africa/Juba` |
| is_active | BOOLEAN | Account suspension |
| two_factor_* | various | 2FA support (future module) |

### `otp_codes`

Stores hashed OTP codes for login, phone verification, password reset.

### `oauth_providers`

Social login linkage (Google, Facebook).

### Spatie Permission Tables

- `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

## Indexes

- `users.email`, `users.phone`, `users.uuid` — unique
- `users.is_active`, `users.created_at` — filtered queries
- `otp_codes(identifier, purpose)` — OTP lookup
- `activity_logs(subject_type, subject_id)` — polymorphic queries
