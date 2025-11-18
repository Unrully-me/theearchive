# ⚡ THEE ARCHIVE - QUICK START (5 MINUTES!)

## 🎯 SUPER FAST DEPLOYMENT TO STELLAR

### ✅ WHAT'S ALREADY DONE:
- Backend configured (Supabase)
- Frontend built (React + Tailwind)
- Admin portal ready
- Ad system ready (replace countdowns with real ads)

---

## 🚀 DEPLOY IN 4 STEPS (5 MIN!)

### STEP 1: Open in VS Code
```bash
# Download this project
# Open in VS Code
# Open terminal (Ctrl + `)
```

### STEP 2: Install & Build
```bash
npm install
npm run build
```
⏱️ Takes 2-3 minutes

### STEP 3: Deploy Supabase Backend
```bash
# Install Supabase CLI (one time only)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref avvwsbiqgtjcwphadypu

# Deploy backend
supabase functions deploy make-server-4d451974
```
⏱️ Takes 1-2 minutes

### STEP 4: Upload to Stellar
1. Open your Stellar hosting dashboard
2. Go to File Manager
3. Upload ALL files from `/dist` folder
4. Done! 🎉

---

## 🧪 TEST YOUR BACKEND NOW

Run this in terminal:
```bash
curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

Should return: `{"status":"ok"}`

If not working, deploy backend first (Step 3)!

---

## 📱 AFTER DEPLOYMENT

### Add Your First Movie:
1. Go to your site
2. Click red dot on logo 6 times
3. Password: `0701680Kyamundu`
4. Add movie details:
   - Upload video to AWS S3 first
   - Use S3 URL as "AWS Video URL"
   - Add thumbnail image URL
   - Save!

### Replace Ad Countdowns:
- Search ads: 15 second countdown → Replace with Google AdSense
- Download ads: 50 second countdown → Replace with Google AdSense
- See `/DEPLOYMENT_GUIDE.md` for exact code locations

---

## 🔥 YOUR BACKEND API ENDPOINTS

Base URL: `https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974`

- `GET /health` - Check if backend is alive
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get single movie
- `POST /movies` - Add new movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

---

## 🎬 AWS S3 SETUP (FOR VIDEO HOSTING)

```bash
# Install AWS CLI
# https://aws.amazon.com/cli/

# Configure AWS
aws configure

# Create bucket (one time)
aws s3 mb s3://thee-archive-movies

# Make bucket public (for downloads)
aws s3api put-public-access-block \
    --bucket thee-archive-movies \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Upload a movie
aws s3 cp my-movie.mp4 s3://thee-archive-movies/movies/ --acl public-read

# Get URL
echo "https://thee-archive-movies.s3.amazonaws.com/movies/my-movie.mp4"
```

---

## 💰 GOOGLE ADSENSE INTEGRATION

### Get AdSense Code:
1. Go to https://adsense.google.com
2. Create new ad unit
3. Copy the code that looks like:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXX"
     data-ad-slot="YYYYYYYYYY"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Replace in Code:
- Open `/App.tsx`
- Find: `{/* REPLACE THIS WITH YOUR GOOGLE ADSENSE CODE */}`
- Replace the placeholder divs with your AdSense code
- Rebuild: `npm run build`
- Re-upload to Stellar

---

## ✅ CHECKLIST

Before going live:
- [ ] Backend deployed to Supabase
- [ ] Frontend built (`/dist` folder created)
- [ ] Uploaded to Stellar hosting
- [ ] Site loads on your domain
- [ ] Admin portal works (6 clicks)
- [ ] Test add a movie
- [ ] Movie displays on homepage
- [ ] Google AdSense integrated
- [ ] AWS S3 bucket ready for videos

---

## 🐛 QUICK FIXES

### "Backend not responding"
```bash
supabase functions deploy make-server-4d451974
```

### "Movies not showing"
- Check browser console (F12)
- Verify backend is deployed
- Add a test movie via admin portal

### "Build failed"
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 📞 NEED HELP?

- Supabase Dashboard: https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu
- Check function logs: `supabase functions logs make-server-4d451974`

---

**🎉 YOU'RE READY TO GO LIVE! 🚀**
