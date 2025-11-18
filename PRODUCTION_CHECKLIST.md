# 🚀 Production Deployment - Final Steps

## ✅ Backend (Render) - Environment Variables to Update

**Go to Render Dashboard → shophub service → Environment**

Update these variables:

```
NODE_ENV=production
MONGO_URI=<your-existing-atlas-uri>
JWT_SECRET=<ROTATE-generate-new-64-char-random-string>
JWT_EXPIRE=30d
CORS_ORIGIN=https://shophub-eight-beta.vercel.app
CLOUDINARY_CLOUD_NAME=dybshbvli
CLOUDINARY_API_KEY=931534674452919
CLOUDINARY_API_SECRET=oJML_tk4R01HzCEX4-52_2SHX5k
CLOUDINARY_FOLDER=ecommerce-products
ENABLE_ADMIN_SEED=false
ADMIN_SEED_EMAIL=admin@shophub.com
ADMIN_SEED_PASSWORD=<your-strong-password>
```

**IMPORTANT:** Remove `PORT` variable if present (Render sets it automatically).

### Generate New JWT_SECRET
```powershell
# PowerShell - generate 64 random chars
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

After updating: Click "Save Changes" → Render will auto-redeploy.

---

## ✅ Frontend (Vercel) - Environment Variable

**Vercel Dashboard → shophub project → Settings → Environment Variables**

Ensure this is set:
```
VITE_API_URL=https://shophub-s0ru.onrender.com/api
```

If you change it, trigger a redeploy from Deployments tab.

---

## 🧪 Testing Checklist

### 1. Backend Health
```powershell
curl https://shophub-s0ru.onrender.com/api/health
# Expected: {"ok":true}
```

### 2. Frontend Load
- Visit: https://shophub-eight-beta.vercel.app
- Check browser console for errors
- Verify products load on homepage

### 3. Authentication Flow
- ✅ Signup new user
- ✅ Login with new user
- ✅ Login with admin (admin@shophub.com)
- ✅ Check user profile loads

### 4. E-commerce Flow
- ✅ Browse products
- ✅ Add items to cart
- ✅ Checkout and place order
- ✅ View orders in dashboard

### 5. Admin Features
- ✅ Login as admin
- ✅ View admin panel
- ✅ Add/edit/delete products
- ✅ View all orders

### 6. Network Check
- Open DevTools → Network tab
- All API calls should:
  - Use HTTPS (not mixed content)
  - Return 200/201 (not 4xx/5xx)
  - No CORS errors

---

## 🔒 Security Hardening Completed

- ✅ Helmet (HTTP security headers)
- ✅ Compression (gzip)
- ✅ Rate limiting (300 req/15min)
- ✅ Morgan logging (combined mode in prod)
- ✅ Environment-based admin seeding
- ✅ CORS restricted to frontend domain
- ✅ HTTPS enforced (Render + Vercel default)
- ✅ JWT with strong secret
- ✅ Bcrypt password hashing

---

## 📊 Monitoring Setup (Optional but Recommended)

### 1. Uptime Monitoring
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Monitor: `https://shophub-s0ru.onrender.com/api/health`
- Interval: 5 minutes
- Alert: Email when down

### 2. Error Tracking
- [Sentry](https://sentry.io) for backend errors
- [Vercel Analytics](https://vercel.com/analytics) for frontend

### 3. Render Logs
- Check regularly: Render Dashboard → Logs
- Watch for:
  - Rate limit 429 responses
  - Failed auth attempts
  - Database connection issues

---

## 🔧 Post-Deployment Tweaks

### If Rate Limit Too Strict
Edit `server/src/server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // increase from 300
  // ...
});
```
Commit → Push → Auto-redeploys on Render.

### If Need to Add CORS Domain
Render env: `CORS_ORIGIN=https://shophub-eight-beta.vercel.app,https://custom-domain.com`

### To Re-enable Admin Seeding
Render env: `ENABLE_ADMIN_SEED=true` → Redeploy → Set back to `false`

---

## 🎯 Performance Optimization (Future)

1. **Database Indexes** (if queries slow):
   ```javascript
   // In Product.js model
   productSchema.index({ category: 1, createdAt: -1 });
   ```

2. **Pagination** (for large product lists):
   - Add `?page=1&limit=20` to `/api/products`
   - Implement in `productController.js`

3. **Image Optimization**:
   - Use Cloudinary transformations
   - Lazy load images on frontend

4. **Caching**:
   - Add Redis for session storage
   - Cache product listings (5 min TTL)

---

## 🚨 Common Issues & Fixes

### Issue: "Network Error" on Frontend
- **Check:** Is `VITE_API_URL` correct in Vercel?
- **Check:** Did you trigger redeploy after changing env?
- **Fix:** Vercel → Settings → Env Vars → Save → Deployments → Redeploy

### Issue: CORS Error
- **Check:** Backend `CORS_ORIGIN` matches frontend URL exactly
- **Fix:** Render → Environment → Update `CORS_ORIGIN` → Save (auto-redeploys)

### Issue: 401 Unauthorized
- **Check:** JWT secret matches between deployments
- **Fix:** Clear browser localStorage → Re-login

### Issue: Images Not Loading
- **Check:** Cloudinary env vars set correctly
- **Check:** Network tab shows cloudinary.com requests
- **Fix:** Re-upload images from admin panel

### Issue: Render Service Sleeping (Free Tier)
- **Symptom:** First request takes 30-50 seconds
- **Fix:** Use UptimeRobot to ping every 5 min (keeps awake)
- **Or:** Upgrade to paid tier ($7/month)

---

## ✅ Deployment Complete!

**Your Deployed URLs:**
- **Frontend:** https://shophub-eight-beta.vercel.app
- **Backend:** https://shophub-s0ru.onrender.com
- **Health Check:** https://shophub-s0ru.onrender.com/api/health

**Admin Credentials:**
- Email: admin@shophub.com
- Password: <your-strong-password-from-env>

---

## 🎉 Next Steps

1. Share your app URL with friends/testers
2. Add custom domain (optional)
3. Set up Google Analytics (optional)
4. Add email notifications (SendGrid/Mailgun)
5. Implement search functionality
6. Add payment integration (Stripe/PayPal)
7. Build mobile app with React Native

**Great job deploying your first full-stack e-commerce app! 🚀**
