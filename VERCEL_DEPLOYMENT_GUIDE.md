# Vercel Deployment Guide for TutorLink System

## Architecture

This is a **monorepo** with:
- **Frontend**: React + Vite (deploys to Vercel)
- **Backend**: Node.js + Express (deploys separately to another service)

**Important:** Frontend and backend must be deployed to separate services/projects.

## Problems Fixed

1. ✅ **Hardcoded API URLs** - Frontend was calling `http://localhost:3000` in production
2. ✅ **Monorepo Configuration** - Configured `vercel.json` to deploy ONLY frontend
3. ✅ **Peer Dependency Issues** - Fixed cloudinary version conflict
4. ✅ **No Error Handling** - Added global error handler middleware
5. ✅ **Environment Variables** - Set up proper `.env.production` configuration

## Changes Made

### 1. Frontend API Configuration (CRITICAL)
- ✏️ `frontend/src/api/axiosClient.js` - Now uses `VITE_API_BASE_URL` env var
- ✏️ `frontend/src/api/axiosConfig.js` - Updated with env var
- ✏️ `frontend/src/services/api.js` - Updated with env var
- ✏️ `frontend/src/socket.js` - Uses `VITE_SOCKET_URL` env var
- ✏️ `frontend/src/context/AuthContext.jsx` - Updated API URL in refreshUser()
- ✏️ `frontend/src/utils/avatar.js` - Uses backend URL from env
- ✏️ `frontend/src/pages/*.jsx` - All video URLs use env variables

### 2. Backend Configuration
- ✏️ `backend/package.json` - Fixed cloudinary version (`^1.41.0` instead of `^2.10.0`)
- ✏️ `backend/src/app.js` - Added global error handler and 404 handler
- ✏️ `backend/server.js` - Added process error handlers and better logging

### 3. Root Configuration
- ✨ `vercel.json` - Builds and deploys ONLY frontend, serves as SPA
- ✨ `.vercelignore` - Excludes backend and unnecessary files from Vercel
- ✨ `package.json` - Updated to workspace configuration
- ✨ `frontend/.env.production` - Production environment variables template
- ✨ `frontend/.env.example` - Example environment variables

## How to Deploy

### Step 1: Deploy Backend First

Backend must be deployed to a separate service. Choose one:

**Option A: Separate Vercel Project**
```bash
cd backend
vercel new --name tutorlink-system-backend
# Follow prompts, deploy backend
# Get the URL from Vercel dashboard
```

**Option B: Railway.app** (Recommended for Node.js)
```bash
# Go to https://railway.app
# Connect GitHub
# Select backend folder
# Set environment variables
# Deploy
```

**Option C: Render.com**
```bash
# Go to https://render.com
# Create new Web Service
# Connect GitHub repo
# Set build/start commands
# Deploy
```

### Step 2: Get Backend URL

Note your backend deployment URL:
- Vercel: `https://tutorlink-system-backend.vercel.app`
- Railway: `https://your-backend-railway-app.up.railway.app`
- Render: `https://your-backend-render.onrender.com`

### Step 3: Set Frontend Environment Variables

Go to **Vercel Dashboard → Your Frontend Project → Settings → Environment Variables**

Add:
```
VITE_API_BASE_URL = https://your-backend-url/api
VITE_SOCKET_URL = https://your-backend-url
```

If deploying backend to Vercel, also set backend env vars there:
```
CORS_ORIGINS = https://your-frontend-url.vercel.app
DATABASE_URL = postgresql://user:password@host:port/dbname
NODE_ENV = production
JWT_SECRET = your-jwt-secret
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
# ... other backend env vars
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
# Make sure all changes are committed
git add .
git commit -m "Configure deployment for Vercel"

# Option 1: Using Vercel CLI
npm install -g vercel
vercel deploy --prod

# Option 2: Connect GitHub to Vercel and push
git push origin main
# Vercel will automatically deploy on push
```

### Step 5: Verify Deployment

1. **Frontend**
   - Visit: `https://your-frontend.vercel.app`
   - Check Network tab in browser devtools
   - Verify API calls go to your backend URL
   - Check console for any errors

2. **Backend**
   - Visit: `https://your-backend-url/api/health` (if endpoint exists)
   - Check logs on deployment platform
   - Verify database connection works

3. **Connection Test**
   - Try logging in on frontend
   - Watch Network tab to see `/api/auth/login` call going to backend
   - Check backend logs for connection


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
