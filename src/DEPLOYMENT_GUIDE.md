# 🚀 THEE ARCHIVE - DEPLOYMENT GUIDE

## Project Overview
**FREE MOVIE LIBRARY** - Luganda movie download site with:
- ✅ Supabase backend (already configured)
- ✅ React frontend with Tailwind CSS
- ✅ Secret admin portal (click red dot 6x, password: `0701680Kyamundu`)
- ✅ Google AdSense integration points (15s search ads, 50s download ads)

---

## 🎯 DEPLOYMENT ARCHITECTURE

```
Frontend (Stellar) ←→ Backend (Supabase)
     ↓                      ↓
Your Domain          Auto-deployed
```

---

## 📦 STEP 1: DEPLOY SUPABASE BACKEND (DO THIS FIRST!)

### A. Login to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Find project: `avvwsbiqgtjcwphadypu`

### B. Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref avvwsbiqgtjcwphadypu

# Deploy the server function
supabase functions deploy make-server-4d451974
```

### C. Verify Backend is Live
Test endpoint:
```
https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

Should return: `{"status":"ok"}`

---

## 🏗️ STEP 2: BUILD FRONTEND FOR STELLAR

### A. In VS Code Terminal:
```bash
# Install dependencies
npm install

# Build production version
npm run build
```

This creates a `/dist` folder with optimized static files.

### B. What's Inside /dist:
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
  └── [other static files]
```

---

## 🌐 STEP 3: DEPLOY TO STELLAR HOSTING

### Option 1: Via Stellar Dashboard
1. Login to your Stellar hosting account
2. Go to File Manager
3. Navigate to your domain's root directory (usually `public_html/`)
4. Upload ALL files from `/dist` folder
5. Your site is LIVE! 🎉

### Option 2: Via FTP
```bash
# Use FileZilla or any FTP client
# Host: [from Stellar]
# Username: [from Stellar]
# Password: [from Stellar]

# Upload /dist contents to: public_html/
```

### Option 3: Via Git (if Stellar supports it)
```bash
git push stellar main
```

---

## 🚀 BONUS: DEPLOYING TO VERCEL (recommended for static + backend)

If you prefer Vercel for automatic builds from GitHub, add the following settings in the Vercel dashboard for your project:

1. Build Command: `npm run vercel-build`  # already added to repository
2. Output Directory: `build`
3. Environment Variables: add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as needed

We also included `vercel.json` in the repo to enforce a static build that outputs to `build/`. If your Vercel build logs show a `Permission denied` error on `node_modules/.bin/vite`, changing the build command to `npm run vercel-build` will call Vite via Node and avoid that permission issue.

---

## 🎬 STEP 4: ADD YOUR MOVIES

### A. Access Admin Portal
1. Visit your deployed site
2. Click the red dot on logo 6 times
3. Enter password: `0701680Kyamundu`
3. Enter password: `0701680Kyamundu`

### B. Upload Movies to AWS S3
```bash
# Example AWS CLI command:
aws s3 cp movie.mp4 s3://your-bucket-name/movies/

# Get public URL for video
aws s3 presign s3://your-bucket-name/movies/movie.mp4 --expires-in 31536000
```

### C. Add Movie in Admin Portal
- Title: Movie name
- AWS Video URL: From step B
- Thumbnail URL: Movie poster image URL
- Genre, Year, File Size
- Click "ADD MOVIE"

### ✨ Update Logo & Favicon

To add or change the site icon that appears on browser tabs and when users add the site to their home screen:

1. Prepare your logo in multiple sizes: 16x16, 32x32 (favicon), 192x192 and 512x512 (PWA). Use PNG or SVG.
     - Recommended: `favicon-16x16.png`, `favicon-32x32.png`, `logo-192.png`, `logo-512.png`.
2. Place the files in the `public/` folder so Vite will include them during the build. For example:
     - `public/favicon-32x32.png`
     - `public/favicon-16x16.png`
     - `public/logo-192.png`
     - `public/logo-512.png`
3. Ensure `index.html` contains the correct meta and link tags (we added a placeholder `logo.svg` and `manifest.json` as examples):
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/logo-192.png"> 
<link rel="manifest" href="/manifest.json" />
```
4. Rebuild and redeploy using Vercel or your hosting provider; your new logos will appear automatically after deployment.

#### Short Links

If you want to generate short links for sharing, follow these optional steps:

1. In the Supabase function environment variables add:
     - `ADMIN_PASSWORD` — the same password used for the admin portal, to restrict creation of short links (optional).
     - `DEPLOY_HOST` — your site domain (example.com) so the server returns full `https://example.com/s/<code>` short links.
2. Click the **Generate Short Link** button in the Admin Portal while adding a movie. The short link will be stored in the movie metadata and returned in the UI.

---

## 🎯 STEP 5: INTEGRATE GOOGLE ADSENSE

### Replace Countdown Placeholders:

#### Search Ads (15 seconds):
In `/App.tsx`, find the search ad modal section around line 920:
```tsx
<div className="p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF4500]/10 rounded-xl border-2 border-[#FFD700]/20">
  {/* REPLACE THIS WITH YOUR GOOGLE ADSENSE CODE */}
  <ins className="adsbygoogle"
       style={{ display: 'block' }}
     data-ad-client="ca-pub-5559193988562698"
       data-ad-slot="YYYYYYYYYY"
       data-ad-format="auto"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

#### Download Ads (50 seconds):
In `/App.tsx`, find the download ad modal section around line 820:
```tsx
<div className="my-6 p-8 bg-gradient-to-r from-[#FFD700]/10 to-[#FF4500]/10 rounded-xl">
  {/* REPLACE THIS WITH YOUR GOOGLE ADSENSE CODE */}
     <ins className="adsbygoogle"
       style={{ display: 'block' }}
               data-ad-client="ca-pub-5559193988562698"
       data-ad-slot="YYYYYYYYYY"
       data-ad-format="auto"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

---

## 🔐 SECURITY NOTES

### Passwords & Secrets
- Admin password: `0701680Kyamundu` (hardcoded in frontend)
- Supabase keys: Already configured in `/utils/supabase/info.tsx`
- AWS S3 URLs: Should be public or pre-signed

### Backend Security
- All movie data stored in Supabase `kv_store_4d451974` table
- Frontend makes API calls to Supabase edge function
- No server code runs on Stellar (only static files)

---

## 🐛 TROUBLESHOOTING

### Backend Not Working?
```bash
# Check Supabase function logs
supabase functions logs make-server-4d451974

# Test endpoint manually
curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

### Movies Not Loading?
1. Check browser console for errors
2. Verify Supabase function is deployed
3. Check if movies exist in database:
   - Login to Supabase Dashboard
   - Go to Table Editor
   - Open `kv_store_4d451974` table
   - Look for keys starting with `movie:`

### Admin Portal Not Opening?
- Make sure you click red dot exactly 6 times
- Check console for JavaScript errors

### Build Errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] Supabase backend deployed and responding
- [ ] Frontend built successfully (`/dist` folder created)
- [ ] Files uploaded to Stellar hosting
- [ ] Site loads on your custom domain
- [ ] Admin portal opens (click red dot 6x)
- [ ] Can add movies via admin panel
- [ ] Movies display on homepage
- [ ] Search function triggers 15s ad
- [ ] Download button triggers 50s ad
- [ ] Download starts after ad countdown

---

## 📞 SUPPORT

### Supabase Issues
- Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu

### Stellar Hosting Issues
- Contact Stellar support for FTP/deployment help

### AWS S3 Issues
- Docs: https://aws.amazon.com/s3/

---

## 🚀 QUICK DEPLOY COMMANDS

```bash
# Full deployment in 4 commands:
npm install
npm run build
# Upload /dist to Stellar
# Done! 🎉
```

---

**Built with ❤️ for Ugandan cinema | Powered by Supabase + React + Tailwind**
