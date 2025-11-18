# 🚀 THEE ARCHIVE - DEPLOYMENT GUIDE

## Project Overview
**FREE GANDA & CLEAR MOVIE LIBRARY** - Luganda movie download site with:
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

## 🎬 STEP 4: ADD YOUR MOVIES

### A. Access Admin Portal
1. Visit your deployed site
2. Click the red dot on logo 6 times
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
       data-ad-client="ca-pub-XXXXXXXXXX"
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
       data-ad-client="ca-pub-XXXXXXXXXX"
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
