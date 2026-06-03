# TutorLink System - Deployment Quick Start

## Project Structure

```
tutorlink-system/
├── frontend/          # React + Vite (deploys to Vercel)
├── backend/           # Node.js + Express (deploys separately)
├── docs/              # Documentation
└── README.md
```

## Quick Deployment Steps

### 1. Deploy Backend First
Choose one platform:
- **Vercel** (easiest): `cd backend && vercel deploy --prod`
- **Railway** (recommended): Go to railway.app, connect repo
- **Render**: Go to render.com, create web service

**Note the backend URL** (e.g., `https://tutorlink-api.vercel.app`)

### 2. Set Frontend Environment Variables
Go to **Vercel Dashboard → Settings → Environment Variables** and add:
```
VITE_API_BASE_URL=https://your-backend-url/api
VITE_SOCKET_URL=https://your-backend-url
```

### 3. Deploy Frontend
```bash
git add .
git commit -m "Deployment configuration"
git push origin main
```
Vercel will auto-deploy on push.

### 4. Verify
- Visit frontend: `https://your-frontend.vercel.app`
- Open DevTools → Network tab
- Try logging in
- Verify API calls go to backend URL

## Documentation

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Detailed deployment guide
- **[backend/README.md](./backend/README.md)** - Backend documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation

## Common Issues

### Frontend shows 500 error
- Check environment variables are set in Vercel Dashboard
- Verify backend URL is correct and accessible
- Check backend logs: `vercel logs --follow`

### API calls fail with CORS error
- Update backend `CORS_ORIGINS` to include frontend URL
- Ensure backend has proper CORS headers configured
- Check browser console for actual error message

### Socket.io connection fails
- Verify `VITE_SOCKET_URL` is set to backend URL
- Check backend Socket.io configuration
- Ensure WebSocket is enabled (Vercel supports it by default)

## Environment Variables

### Frontend
```
VITE_API_BASE_URL = Backend API URL (e.g., https://api.example.com/api)
VITE_SOCKET_URL = Backend Socket URL (e.g., https://api.example.com)
```

### Backend
```
NODE_ENV = production
PORT = (auto-assigned by platform)
DATABASE_URL = PostgreSQL connection string
CORS_ORIGINS = Frontend URL (e.g., https://frontend.vercel.app)
JWT_SECRET = Secret key for tokens
CLOUDINARY_CLOUD_NAME = Cloudinary config
CLOUDINARY_API_KEY = Cloudinary config
CLOUDINARY_API_SECRET = Cloudinary config
```

## Support

For more detailed information:
1. Check deployment guide: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. Check troubleshooting: See DEPLOYMENT_CHECKLIST.md
3. Check backend logs: `vercel logs --follow` (if using Vercel)
4. Check frontend errors: Browser DevTools console and Network tab
