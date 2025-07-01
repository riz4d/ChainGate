## Authentication Integration Guide

### Overview
The authentication system is now fully integrated with:
- **HTTP-only cookie** for refresh tokens (set by backend)
- **SessionStorage** for access tokens (managed by frontend)
- **Automatic token refresh** every 10 seconds and on 401 responses
- **Route protection** via AuthProvider

### Backend Endpoints

#### Login: `POST /api/supervisor/access/`
```json
// Request
{
  "email": "admin@example.com",
  "password": "password123"
}

// Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```
- Sets `refresh_token` as HTTP-only cookie automatically
- Stores access token in sessionStorage
- Stores admin info in sessionStorage

#### Refresh: `POST /api/supervisor/refresh-token/`
```json
// Request (optional, reads from HTTP-only cookie if not provided)
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

// Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Logout: `POST /api/supervisor/logout/`
- Blacklists the refresh token
- Clears the HTTP-only cookie
- Requires Authorization header with access token

### Frontend Usage

#### Making API Requests
```typescript
import { ApiClient } from '@/lib/api'

// All requests automatically include credentials and handle token refresh
const data = await ApiClient.get('/api/users/')
const newUser = await ApiClient.post('/api/users/', { name: 'John Doe' })
```

#### Direct Authentication Functions
```typescript
import { loginAPI, logoutAPI, refreshAccessToken } from '@/lib/api'

// Login
const loginData = await loginAPI(email, password)
sessionStorage.setItem('access_token', loginData.access_token)
sessionStorage.setItem('admin', JSON.stringify(loginData.admin))

// Logout
await logoutAPI() // Automatically clears tokens and cookies

// Manual refresh (usually handled automatically)
const newAccessToken = await refreshAccessToken()
```

### How It Works

1. **Login Flow:**
   - User submits credentials to `/api/supervisor/access/`
   - Backend validates and returns access token + sets HTTP-only refresh cookie
   - Frontend stores access token in sessionStorage
   - User is redirected to dashboard

2. **Automatic Token Refresh:**
   - AuthProvider refreshes tokens every 10 seconds
   - API requests automatically refresh on 401 responses
   - Uses HTTP-only cookie for refresh token security

3. **Route Protection:**
   - AuthProvider wraps all pages
   - Checks for both access token and refresh cookie
   - Redirects to login if tokens are missing/invalid
   - Only `/login` route is public

4. **Logout Flow:**
   - Calls logout API to blacklist refresh token
   - Clears sessionStorage and HTTP-only cookie
   - Redirects to login page

### Security Features

- **HTTP-only cookies** prevent XSS attacks on refresh tokens
- **Automatic token refresh** maintains session without user intervention
- **Token blacklisting** on logout prevents token reuse
- **Secure cookie flags** (Secure, SameSite=Strict)
- **Automatic cleanup** on authentication failures

### Error Handling

- **Token refresh failures** automatically log out user
- **API request failures** with proper error messages
- **Session expiration** redirects to login with clear messages
- **Network errors** are handled gracefully

### Testing

1. Start the backend server
2. Navigate to the login page
3. Enter valid credentials
4. Verify dashboard loads with user info
5. Check browser cookies for `refresh_token`
6. Check sessionStorage for `access_token` and `admin`
7. Test logout functionality
8. Verify automatic token refresh in Network tab

The authentication system is now production-ready with robust security and error handling.
