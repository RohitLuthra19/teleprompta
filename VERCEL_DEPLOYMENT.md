# Vercel Deployment Guide

## Setting Environment Variables on Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | _(leave empty)_ | Production |
| `DATABASE_URL` | `postgresql://...` | Production |
| `JWT_SECRET` | `your-secret-key` | Production |

**Important**: For `EXPO_PUBLIC_API_BASE_URL`, leave the value completely empty (not even a space) to enable same-origin API calls.

### Option 2: Vercel CLI
```bash
# Set empty API base URL for same-origin calls
vercel env add EXPO_PUBLIC_API_BASE_URL

# When prompted:
# - Value: (leave empty, just press Enter)
# - Environment: Production

# Set database URL
vercel env add DATABASE_URL
# Value: postgresql://username:password@host:port/database
# Environment: Production

# Set JWT secret
vercel env add JWT_SECRET
# Value: your-secret-key-here
# Environment: Production
```

## Database Setup

### Option 1: Neon (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Use it as your `DATABASE_URL`

### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the URI connection string
5. Use it as your `DATABASE_URL`

## Testing the Deployment

After setting up the environment variables:

1. **Deploy**: Push your changes or redeploy on Vercel
2. **Test API Health**: Visit `https://your-app.vercel.app/api/health`
3. **Check Frontend**: The app should make API calls to the same domain

## Troubleshooting

- **API calls to localhost**: Environment variable not set correctly
- **Database connection errors**: Check `DATABASE_URL` format
- **404 on API routes**: Vercel routing issue, check `vercel.json`
- **Build errors**: Check build logs in Vercel dashboard