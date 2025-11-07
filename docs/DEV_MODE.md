# Development Mode Configuration

## Overview

Development mode allows you to bypass authentication during local development, making it easier to test features without setting up a full authentication backend.

## Enabling Dev Mode

### 1. Configuration

Add the following to your [.env.local](../.env.local) file:

```bash
NEXT_PUBLIC_DEV_MODE=true
```

### 2. Restart Development Server

After changing environment variables, restart your Next.js dev server:

```bash
npm run dev
```

## What Dev Mode Does

When `NEXT_PUBLIC_DEV_MODE=true`, the following happens:

### ✅ Authentication Bypass
- **No login required** - You can access all pages directly
- **Mock user data** - A fake user is automatically created:
  ```typescript
  {
    token: 'dev-mode-token',
    userId: 'dev-user-123',
    email: 'dev@havenhub.com',
    name: 'Dev User',
    companies: [{
      companyId: 'dev-company-1',
      name: 'Dev Company',
      role: 'super_admin'
    }],
    currentCompanyId: 'dev-company-1',
    expiresAt: '24 hours from now'
  }
  ```

### ✅ Super Admin Permissions
- Full access to all features
- Can create, update, and delete all entities
- Access to all companies, projects, departments, and properties

### ✅ Skip OAuth Flow
- No need to configure Google OAuth
- No need to set up backend authentication

## Disabling Dev Mode (Production)

### For Production Deployment:

1. **Remove or set to false** in `.env.production`:
   ```bash
   NEXT_PUBLIC_DEV_MODE=false
   ```

2. **Or simply omit** the variable entirely - it defaults to `false`

3. **Never commit** `.env.local` to version control (it's already in `.gitignore`)

## Security Notes

⚠️ **IMPORTANT**:
- Dev mode is **ONLY** for local development
- **NEVER** enable dev mode in production
- The mock user has **super admin** privileges
- All API calls will use the fake dev token

## Implementation Details

### Files Modified

1. **[lib/services/auth.ts](../lib/services/auth.ts)**
   - `getAuth()` method checks `NEXT_PUBLIC_DEV_MODE`
   - Returns mock user data when enabled
   - Console logs when dev mode is active

2. **[lib/hooks/useAuth.ts](../lib/hooks/useAuth.ts)**
   - `useAuth()` hook respects dev mode flag
   - Skips redirect to login when dev mode is enabled

3. **[.env.local](../.env.local)**
   - Configuration file for environment variables
   - Not committed to git (local only)

## Usage Examples

### Example 1: Testing Z-AI Chat
```bash
# 1. Enable dev mode
echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local

# 2. Start frontend
npm run dev

# 3. Open browser
# http://localhost:3000
# No login required - goes straight to dashboard

# 4. Navigate to Z-AI
# Click "Z AI" in sidebar or go to /z-ai
```

### Example 2: Testing with Backend
```bash
# Terminal 1 - Backend
cd c:\repositories\HavenzHub-AI
uvicorn main:app --port 8001

# Terminal 2 - Frontend (dev mode enabled)
cd c:\repositories\HavenzHub-AI\Zhub_original
npm run dev

# Z-AI will now work with backend on localhost:8001
```

### Example 3: Switching Back to Real Auth
```bash
# Edit .env.local
NEXT_PUBLIC_DEV_MODE=false

# Restart dev server
# Ctrl+C to stop
npm run dev

# Now login page will be enforced
```

## Troubleshooting

### Issue: Dev mode not working
**Solution**: Ensure you restarted the Next.js dev server after changing `.env.local`

### Issue: Still redirecting to login
**Solution**: Check that the variable is exactly `NEXT_PUBLIC_DEV_MODE=true` (case-sensitive)

### Issue: Console shows "[DEV MODE]" but still asking for login
**Solution**: Clear browser localStorage and refresh: `localStorage.clear()`

### Issue: Backend API calls failing
**Solution**: The dev token is fake - backend may reject it. Use backend's dev mode or disable auth checks on backend as well.

## Environment Variable Reference

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `NEXT_PUBLIC_DEV_MODE` | `true` / `false` | `false` | Enable/disable dev mode authentication bypass |
| `NEXT_PUBLIC_API_BASE_URL` | URL string | `http://localhost:8001` | Backend API base URL |
| `NEXT_PUBLIC_API_URL` | URL string | `http://localhost:5087` | Legacy API URL (for BMS backend) |

## Best Practices

✅ **DO**:
- Use dev mode for rapid local development
- Test features without auth complexity
- Keep `.env.local` in `.gitignore`
- Document when dev mode is required for testing

❌ **DON'T**:
- Enable dev mode in production
- Commit `.env.local` to version control
- Share dev mode tokens (they're not real anyway)
- Rely on dev mode for security testing

## Related Documentation

- [Backend API Documentation](../../documentation/BACKEND_API.md)
- [Frontend Auth Guide](./FRONTEND_AUTH_GUIDE.md)
- [Authorization](./AUTHORIZATION.md)

---

**Last Updated**: 2025-01-06
**Maintainer**: Havenz Hub Development Team
