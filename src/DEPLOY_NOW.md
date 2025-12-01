# 🚀 DEPLOY NOW - One Page Guide

**Time Required:** 15 minutes  
**Difficulty:** Easy  
**Prerequisites:** None (we'll install everything)

---

## 📋 WHAT YOU'LL DO

1. Deploy backend to Supabase (5 min)
2. Build frontend (3 min)
3. Verify everything works (2 min)
4. Upload to hosting (5 min)

---

## 🎯 STEP 1: Deploy Backend

### 1.1 Install Supabase CLI

**Mac/Linux:**
```bash
npm install -g supabase
```

**Windows:**
```cmd
npm install -g supabase
```

Wait for installation to complete...

---

### 1.2 Login to Supabase

```bash
supabase login
```

- A browser window will open
- Click "Authorize"
- Come back to terminal

---

### 1.3 Link Your Project

```bash
supabase link --project-ref avvwsbiqgtjcwphadypu
```

- If prompted for password, check your Supabase dashboard
- Dashboard → Settings → Database → Password

---

### 1.4 Deploy the Function

```bash
supabase functions deploy make-server-4d451974
```

Wait for deployment... You should see:
```
✅ Deployed Function make-server-4d451974
```

---

### 1.5 Set Environment Variables

1. Go to: https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu
2. Click: **Edge Functions** (left sidebar)
3. Click: **make-server-4d451974**
4. Click: **Settings** tab
5. Click: **Add new secret**

Add these two secrets:

**Secret 1:**
- Name: `SUPABASE_URL`
- Value: `https://avvwsbiqgtjcwphadypu.supabase.co`

**Secret 2:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Get this from Dashboard → Settings → API → `service_role` key (secret)

Click **Save** after adding each one.

---

## ✅ STEP 2: Verify Backend

### Option A: Use Verification Script (Recommended)

**Mac/Linux:**
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

**Windows:**
```cmd
verify-deployment.bat
```

You should see:
```
🎉 ALL TESTS PASSED! Server is running!
```

If you see errors, wait 30 seconds and run again (functions take time to start).

---

### Option B: Test in Browser

1. Open: `/test-server.html` in your browser
2. Click: "Run Server Tests"
3. All three should show ✅ green checkmarks

---

### Option C: Test Manually

Open this URL in your browser:
```
https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

Should show:
```json
{"status":"ok"}
```

---

## 🏗️ STEP 3: Build Frontend

```bash
npm install
```

Wait for packages to install...

```bash
npm run build
```

Wait for build to complete... You should see:
```
✓ built in 15s
```

Your files are now in the `/dist` folder! 🎉

---

## 🌐 STEP 4: Upload to Hosting

### For Stellar Hosting:

1. **Login** to your Stellar dashboard
2. Go to **File Manager**
3. Click **Upload Files**
4. Select **ALL files from /dist folder**
5. Click **Upload**
6. Wait for upload to complete

Your site is now LIVE! 🚀

---

### For Other Hosting:

Upload everything from `/dist` folder to your web host's `public_html` or `www` folder.

---

## 🎉 YOU'RE DONE!

Your site should now be live at your domain!

### Test Your Live Site:

1. **Visit your domain**
   - Home page should load
   - Should see purple/cyan gradient background

2. **Test Admin Portal**
   - Click the red dot in logo 6 times
   - Password: `0701680Kyamundu`
   - Admin portal should open

3. **Add Your First Movie**
   - In admin portal
   - Click "Add Movie"
   - Fill in details
   - Use an AWS S3 URL or direct link
   - Click "Save"

---

## 🆘 TROUBLESHOOTING

### Backend deployment failed?
```bash
# Update Supabase CLI
npm install -g supabase@latest

# Try again
supabase functions deploy make-server-4d451974
```

---

### Frontend build failed?
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run build
```

---

### Site shows "Server Not Deployed" banner?
- Backend isn't deployed yet
- Follow Step 1 again
- Make sure environment variables are set
- Wait 1-2 minutes after deployment

---

### Movies not loading?
1. Open browser console (F12)
2. Check for error messages
3. Verify backend is deployed (run verify script)
4. Check Supabase logs: Dashboard → Edge Functions → Logs

---

### Can't access admin portal?
- Make sure you click red dot EXACTLY 6 times
- Wait 1 second between clicks
- Refresh page and try again

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify these work:

- [ ] Site loads at your domain
- [ ] No console errors (F12)
- [ ] Admin portal opens (6 clicks on red dot)
- [ ] Can add a test movie in admin
- [ ] Movie appears on homepage
- [ ] Can play/stream movie
- [ ] Search bar works
- [ ] Navigation tabs work
- [ ] All sections load (Movies, Series, Music, etc.)

---

## 🎬 NEXT STEPS

### Immediate:
1. **Add Content** - Upload 10-20 movies via admin portal
2. **Test Everything** - Browse, search, play videos
3. **Customize** - Change admin password, add branding

### This Week:
1. **Setup AWS S3** - For video hosting (see aws-s3-setup.md)
2. **Configure Ads** - PropellerAds or AdSterra
3. **Promote** - Share your site!

### This Month:
1. **Add 50+ Movies** - Build your library
2. **Monitor Analytics** - Check admin dashboard
3. **Engage Users** - Promote GM social feed

---

## 💡 PRO TIPS

### Performance
- Use AWS S3 or CloudFlare R2 for videos
- Compress video files (keep under 2GB each)
- Use WebP images for thumbnails

### Content
- Add movies regularly (daily/weekly)
- Use high-quality thumbnails
- Write engaging descriptions
- Tag content accurately

### SEO
- Use descriptive titles
- Add meta descriptions
- Share on social media
- Build backlinks

---

## 🔗 QUICK LINKS

### Your Deployment
- **Site:** Your custom domain
- **Admin:** Click red dot 6x
- **Backend:** https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974
- **Dashboard:** https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu

### Documentation
- **Full Guide:** `/DEPLOYMENT_GUIDE.md`
- **AWS Setup:** `/aws-s3-setup.md`
- **Troubleshooting:** `/DEPLOYMENT_INSTRUCTIONS.md`
- **Current Status:** `/CURRENT_STATUS.md`

---

## 🎊 CONGRATULATIONS!

You've successfully deployed THEE ARCHIVE!

Your movie library is now live and ready for users! 🚀🎬

---

**Questions?** Check the docs or open the browser console for detailed error messages.

**Updates?** Pull the latest code and run `npm run build` again.

**Issues?** Check `/CURRENT_STATUS.md` for known issues and solutions.

---

*Built with ❤️ | React + Supabase + Tailwind CSS*  
*Time to completion: ~15 minutes*  
*Status: Production Ready* ✅
