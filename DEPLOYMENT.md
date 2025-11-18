# 🚀 Production Deployment Guide - ShopHub

Tumhara backend ab production-ready hai with security hardening. Follow steps for deployment.

---

## ✅ Backend Hardening Applied

- ✅ **Helmet** – Security HTTP headers (XSS, HSTS, CSP, etc.)
- ✅ **Compression** – gzip/deflate response compression
- ✅ **Rate Limiter** – 300 requests / 15 min per IP (tune as needed)
- ✅ **Morgan** – Request logging (combined mode in production)
- ✅ **Environment-based admin seeding** – Now requires `ENABLE_ADMIN_SEED=true` and `ADMIN_SEED_PASSWORD`

---

## 📦 Backend Deployment (Render / Railway / Fly.io)

### Step 1: Backend Deploy Prep

1. **Create `.env.production` (for reference, not committed):**
   ```env
   PORT=5000
   NODE_ENV=production
   MONGO_URI=<YOUR_ATLAS_URI>
   JWT_SECRET=<ROTATE_THIS_NEW_LONG_RANDOM_STRING>
   JWT_EXPIRE=30d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
   CLOUDINARY_API_KEY=<YOUR_API_KEY>
   CLOUDINARY_API_SECRET=<ROTATE_THIS_NEW_SECRET>
   CLOUDINARY_FOLDER=ecommerce-products
   ENABLE_ADMIN_SEED=true
   ADMIN_SEED_EMAIL=admin@shophub.com
   ADMIN_SEED_PASSWORD=<STRONG_UNIQUE_PASSWORD>
   ADMIN_SEED_NAME=Admin
   ```

2. **Deploy Backend to Render:**
   - Go to https://render.com → New Web Service
   - Connect your GitHub repo (`shophub`)
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` or `node src/server.js`
   - **Environment Variables:** Add all from above `.env.production` in dashboard
   - Deploy → Note the URL: `https://shophub-backend-xyz.onrender.com`

3. **Test Backend Health:**
   ```powershell
   curl https://shophub-backend-xyz.onrender.com/api/health
   # Should return: {"ok":true}
   ```

4. **After First Deploy (Disable Auto Seeding):**
   - Once admin is seeded successfully, set `ENABLE_ADMIN_SEED=false` in Render env vars.
   - This prevents accidental re-seeding or password resets.

---

## 🌐 Frontend Deployment (Vercel / Netlify)

### Step 2: Frontend Deploy

1. **Create `.env.production` (local reference):**
   ```env
   VITE_API_URL=https://shophub-backend-xyz.onrender.com/api
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com → New Project
   - Import your GitHub repo
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL = https://shophub-backend-xyz.onrender.com/api
     ```
   - Deploy → Note the URL: `https://shophub-xyz.vercel.app`

3. **Update Backend CORS:**
   - Go back to Render dashboard → Environment vars
   - Update `CORS_ORIGIN` to:
     ```
     https://shophub-xyz.vercel.app
     ```
   - Restart backend service.

4. **Test Full Stack:**
   - Visit `https://shophub-xyz.vercel.app`
   - Login with admin credentials
   - Verify all API calls work (no CORS errors in browser console)

---

## 🔐 Post-Deployment Security Checklist

- [ ] Rotate `JWT_SECRET` (use a new one, min 32 chars random)
- [ ] Rotate `CLOUDINARY_API_SECRET`
- [ ] Change `ADMIN_SEED_PASSWORD` from default
- [ ] Set `ENABLE_ADMIN_SEED=false` after first successful admin login
- [ ] Verify `CORS_ORIGIN` is exact (no wildcards in production if possible)
- [ ] Enable HTTPS only (both Render and Vercel default to HTTPS)
- [ ] Add custom domain (optional)
- [ ] Set up monitoring (Render logs / Vercel analytics)
- [ ] Test rate limiting: send 310 requests in 15 min → should block

---

## 🛠️ Local Testing Against Production Backend

Before deploying frontend, test locally:

```powershell
# In client/.env.local
VITE_API_URL=https://shophub-backend-xyz.onrender.com/api

# Run local dev server
cd client
npm run dev
```

Verify:
- No console errors
- Login works
- Products load
- Orders fetch

Then deploy frontend.

---

## 🚨 Common Issues

### Issue: CORS Error After Deploy
- **Solution:** Ensure `CORS_ORIGIN` in backend env vars exactly matches frontend URL (no trailing slash).

### Issue: 500 Error on Admin Login
- **Solution:** Check Render logs → likely MongoDB connection issue or wrong `MONGO_URI`.

### Issue: Images Not Loading
- **Solution:** Verify Cloudinary env vars are set correctly. Test upload via Postman first.

### Issue: Rate Limit Too Strict
- **Solution:** Adjust in `server/src/server.js`:
  ```javascript
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // increase this
    ...
  });
  ```

---

## 🎯 Deployment Commands Summary

```powershell
# Backend (Render dashboard)
Root Directory: server
Build: npm install
Start: node src/server.js

# Frontend (Vercel dashboard)
Root Directory: client
Build: npm run build
Output: dist
Framework: Vite
```

---

## 📊 Production Environment Variables Quick Reference

### Backend (Render)
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<new-rotated-secret>
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=<new-rotated-secret>
CLOUDINARY_FOLDER=ecommerce-products
ENABLE_ADMIN_SEED=false  # After first deploy
ADMIN_SEED_EMAIL=admin@shophub.com
ADMIN_SEED_PASSWORD=<strong-unique>
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## ✅ All Done!

Backend hardened ✅  
Frontend configured ✅  
Ready to deploy ✅

**Next Steps:**
1. Deploy backend to Render
2. Get backend URL
3. Deploy frontend to Vercel with backend URL
4. Update CORS in backend
5. Test & enjoy! 🎉

---

**Questions?**
- Check Render logs for backend issues
- Check Vercel logs for build issues
- Use browser DevTools Network tab for API debugging

**Good luck with deployment! 🚀**
