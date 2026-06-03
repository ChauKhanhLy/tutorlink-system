# Vercel Deployment Guide for TutorLink System

## Problems Fixed

1. ✅ **Hardcoded API URLs** - Frontend was calling `http://localhost:3000` in production
2. ✅ **Missing Vercel Configuration** - Added `vercel.json` for proper deployment
3. ✅ **No Error Handling** - Added global error handler middleware
4. ✅ **No Environment Variables** - Set up `.env.production` for frontend

## Changes Made

### 1. Frontend API Configuration (CRITICAL)
- ✏️ `frontend/src/api/axiosClient.js` - Now uses `VITE_API_BASE_URL` env var
- ✏️ `frontend/src/api/axiosConfig.js` - Updated with env var
- ✏️ `frontend/src/services/api.js` - Updated with env var
- ✏️ `frontend/src/socket.js` - Uses `VITE_SOCKET_URL` env var
- ✏️ `frontend/src/context/AuthContext.jsx` - Updated API URL in refreshUser()

### 2. Backend Error Handling
- ✏️ `backend/src/app.js` - Added global error handler and 404 handler
- ✏️ `backend/server.js` - Added process error handlers and better logging

### 3. Deployment Configuration
- ✨ `vercel.json` - Created Vercel deployment config
- ✨ `frontend/.env.production` - Created production environment variables

## How to Deploy on Vercel

### Step 1: Create Backend API on Vercel (if not done)

You need to deploy the backend separately or use a backend service. Options:
- Deploy backend to Vercel, AWS, Railway, Render, or Heroku
- Use an existing backend server URL

### Step 2: Set Environment Variables on Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
VITE_API_BASE_URL = https://your-backend-url/api
VITE_SOCKET_URL = https://your-backend-url
```

**For Backend (if deploying to Vercel):**
```
CORS_ORIGINS = https://your-frontend-url,http://localhost:3000
DATABASE_URL = your-postgresql-url
NODE_ENV = production
```

(Add all your other required backend env vars)

### Step 3: Update Frontend Environment Variables

The `.env.production` file is a template. Update it:

```bash
# If deploying just frontend to Vercel:
# Point to your backend API URL
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

### Step 4: Deploy Frontend to Vercel

```bash
# Option 1: Using Vercel CLI
npm install -g vercel
vercel deploy --prod

# Option 2: Connect GitHub to Vercel and push
git push origin main
```

### Step 5: Deploy Backend (if applicable)

If deploying backend to Vercel:
- Create `backend/vercel.json`:

```json
{
  "buildCommand": "npm install",
  "outputDirectory": "./",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Then deploy:
```bash
cd backend
vercel deploy --prod
```

## File Structure After Changes

```
tutorlink-system/
├── vercel.json (NEW - Root config)
├── frontend/
│   ├── .env.production (NEW - Prod env vars)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js (UPDATED)
│   │   │   └── axiosConfig.js (UPDATED)
│   │   ├── context/
│   │   │   └── AuthContext.jsx (UPDATED)
│   │   ├── services/
│   │   │   └── api.js (UPDATED)
│   │   └── socket.js (UPDATED)
├── backend/
│   ├── server.js (UPDATED)
│   └── src/
│       └── app.js (UPDATED)
```

## Testing Deployment

1. Check frontend loads without errors in browser
2. Verify API calls work (check Network tab)
3. Check console for errors
4. Verify Vercel logs: `vercel logs --follow`

## Common Issues and Solutions

### Issue: "Failed to fetch" / CORS errors
**Solution:** 
- Check `VITE_API_BASE_URL` is correctly set
- Ensure backend has proper CORS headers
- Verify backend `CORS_ORIGINS` includes frontend URL

### Issue: 500 errors on page load
**Solution:**
- Check backend logs: `vercel logs`
- Verify all environment variables are set
- Check database connection in Vercel logs

### Issue: API calls returning 404
**Solution:**
- Verify `VITE_API_BASE_URL` ends with `/api` if needed
- Check backend routes are correctly registered
- Look at backend server logs

### Issue: Socket.io connection fails
**Solution:**
- Ensure `VITE_SOCKET_URL` is set correctly
- Verify WebSocket is enabled in Vercel
- Check backend Socket.io configuration

## Next Steps

1. ✅ Replace `your-backend-url` with actual backend URL in environment variables
2. ✅ Deploy frontend to Vercel
3. ✅ Deploy backend to chosen platform
4. ✅ Set environment variables in Vercel dashboard
5. ✅ Test all API endpoints
6. ✅ Monitor logs for errors: `vercel logs --follow`

## Important Notes

- **Environment Variables:** These must be set in Vercel dashboard, NOT in `.env.production` file
- **CORS:** Must be properly configured on backend
- **Build Command:** Frontend builds to `dist/` folder, backend serves from root
- **Port:** Backend should use `process.env.PORT` (Vercel assigns dynamically)
- **Database:** Ensure PostgreSQL connection URL is valid from Vercel servers

## Debugging

View real-time logs:
```bash
vercel logs --follow
```

Redeploy and watch logs:
```bash
vercel deploy --prod && vercel logs --follow
```

Check environment variables in Vercel:
```bash
vercel env list
```
