# Quick Vercel Deployment Checklist

## 🔧 Changes Made to Your Project

All of the following files have been updated to support production deployment:

### Frontend API Configuration ✅
- [x] `frontend/src/api/axiosClient.js` - Uses `VITE_API_BASE_URL`
- [x] `frontend/src/api/axiosConfig.js` - Uses `VITE_API_BASE_URL`
- [x] `frontend/src/services/api.js` - Uses `VITE_API_BASE_URL`
- [x] `frontend/src/socket.js` - Uses `VITE_SOCKET_URL`
- [x] `frontend/src/context/AuthContext.jsx` - Updated API URL
- [x] `frontend/src/utils/avatar.js` - Uses backend URL from env
- [x] `frontend/src/pages/Lesson.jsx` - Uses env for video URLs
- [x] `frontend/src/pages/VideoRoom.jsx` - Uses `VITE_API_BASE_URL`
- [x] `frontend/src/pages/admin/AdminComplaintsPage.jsx` - Updated video URLs

### Backend Updates ✅
- [x] `backend/server.js` - Added error handling and better logging
- [x] `backend/src/app.js` - Added global error handler middleware

### Deployment Configuration ✅
- [x] `vercel.json` - Root Vercel deployment config
- [x] `frontend/.env.production` - Environment variable template

---

## 🚀 Next Steps to Deploy

### 1. Determine Backend Location
Choose ONE of these options:
- [ ] Deploy backend to Vercel (same project)
- [ ] Deploy backend to Railway.app
- [ ] Deploy backend to Render.com
- [ ] Use existing backend server
- [ ] Deploy to AWS, Azure, or other service

**Get the backend URL:** `https://your-backend-domain.com`

### 2. Set Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**For Frontend:**
```
VITE_API_BASE_URL = https://your-backend-domain.com/api
VITE_SOCKET_URL = https://your-backend-domain.com
```

**For Backend (if deploying to Vercel):**
```
CORS_ORIGINS = https://your-frontend-url.vercel.app
DATABASE_URL = your-postgres-url
NODE_ENV = production
PORT = (leave Vercel to auto-assign)

+ All other backend env vars you currently use
```

### 3. Deploy Frontend

```bash
# Push to GitHub (if connected to Vercel)
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main

# Or deploy directly via CLI
vercel deploy --prod
```

### 4. Deploy Backend (if needed)

If deploying to Vercel:
```bash
cd backend
vercel deploy --prod
```

Get the backend URL from Vercel dashboard.

### 5. Update Frontend Env Vars (if backend URL changed)

After backend is deployed, update the frontend environment variables with the new backend URL.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads without errors: `https://your-frontend-url.vercel.app`
- [ ] Network tab shows successful API calls
- [ ] Console has no major errors (warning are OK)
- [ ] Authentication works (login/logout)
- [ ] Socket.io connects (should see connection in browser console)
- [ ] Image avatars load correctly
- [ ] Videos play correctly
- [ ] Backend logs show connections: `vercel logs --follow`

---

## 🐛 Troubleshooting

### 404 errors on API calls
**Solution:**
- Check `VITE_API_BASE_URL` includes `/api` at the end
- Verify backend is actually running
- Check CORS settings

### CORS errors in console
**Solution:**
- Update backend `CORS_ORIGINS` to include frontend URL
- Ensure credentials: true is set in CORS config

### Socket.io connection fails
**Solution:**
- Check `VITE_SOCKET_URL` is set correctly
- Verify Socket.io server is running on backend
- Check WebSocket support in Vercel (it's enabled by default)

### 500 errors
**Solution:**
- Check `vercel logs --follow` for actual error message
- Verify all environment variables are set correctly
- Check database connection

---

## 📝 File Reference

**Updated Files Summary:**
```
frontend/
├── .env.production (NEW)
└── src/
   ├── api/
   │  ├── axiosClient.js (UPDATED)
   │  └── axiosConfig.js (UPDATED)
   ├── context/
   │  └── AuthContext.jsx (UPDATED)
   ├── pages/
   │  ├── Lesson.jsx (UPDATED)
   │  ├── VideoRoom.jsx (UPDATED)
   │  └── admin/
   │     └── AdminComplaintsPage.jsx (UPDATED)
   ├── services/
   │  └── api.js (UPDATED)
   ├── socket.js (UPDATED)
   └── utils/
      └── avatar.js (UPDATED)

backend/
├── server.js (UPDATED)
└── src/
   └── app.js (UPDATED)

vercel.json (NEW)
VERCEL_DEPLOYMENT_GUIDE.md (NEW)
```

---

## 🎯 Summary

Your app was failing because:
1. Frontend hardcoded `http://localhost:3000` in production
2. No Vercel configuration file
3. No global error handling on backend

**Fixed by:**
1. ✅ All URLs now use environment variables with localhost fallback
2. ✅ Added `vercel.json` configuration
3. ✅ Added error handling middleware to backend
4. ✅ Better logging for debugging

**Next: Set env vars in Vercel and deploy!**
