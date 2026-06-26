# Authentication API — v1

Base URL: `/api/v1/auth`

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Customer registration |
| POST | `/vendor/register` | No | Vendor registration |
| POST | `/login` | No | Email/password login |
| POST | `/logout` | Yes | Revoke current token |
| GET | `/me` | Yes | Current user profile |
| PUT | `/profile` | Yes | Update profile |
| POST | `/otp/send` | No | Send OTP code |
| POST | `/otp/verify` | No | Verify OTP / login |
| POST | `/email/verification-notification` | Yes | Resend verification email |
| GET | `/email/verify/{id}/{hash}` | Signed | Verify email |
| POST | `/forgot-password` | No | Request reset link |
| POST | `/reset-password` | No | Reset with token |

## Example: Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "password_confirmation": "securepassword",
  "phone": "+211912345678",
  "locale": "en",
  "currency": "SSP"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "token": "1|...",
    "token_type": "Bearer",
    "user": {
      "uuid": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["customer"]
    }
  }
}
```

## Example: Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

## OTP Purposes

| Value | Description |
|-------|-------------|
| `login` | OTP-based login |
| `phone_verification` | Verify phone number |
| `password_reset` | Password reset via OTP |
| `two_factor` | 2FA challenge |

## Error Format

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["This email is already registered."]
  }
}
```
