# 🎬 THEE ARCHIVE - Quick Reference Card

**Keep this handy for quick access to important info!**

---

## 🔗 ESSENTIAL LINKS

### Your Project
- **Supabase Dashboard:** https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu
- **API Base URL:** `https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974`
- **Health Check:** https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health

### Testing & Diagnostics
- **Server Test Page:** Open `/test-server.html` in browser
- **Verification Script:** `./verify-deployment.sh` or `verify-deployment.bat`

---

## 🔐 IMPORTANT CREDENTIALS

### Admin Access
- **Method:** Click red dot in logo 6 times
- **Password:** `0701680Kyamundu`
- **Change in:** `/App.tsx` (search for `ADMIN_PASSWORD`)

### Supabase
- **Project ID:** `avvwsbiqgtjcwphadypu`
- **Anon Key:** (already configured in `/utils/supabase/info.tsx`)
- **Service Role Key:** Found in Dashboard → Settings → API

### Function Name
- **Edge Function:** `make-server-4d451974`
- **Path in code:** `/supabase/functions/make-server-4d451974/`

---

## ⚡ COMMON COMMANDS

### Deployment
```bash
# Deploy backend
supabase functions deploy make-server-4d451974

# Build frontend
npm run build

# Verify deployment
./verify-deployment.sh  # or .bat on Windows

# Check function logs
supabase functions logs make-server-4d451974
```

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Clean install
rm -rf node_modules && npm install
```

### Supabase CLI
```bash
# Login
supabase login

# Link project
supabase link --project-ref avvwsbiqgtjcwphadypu

# List projects
supabase projects list

# View logs
supabase functions logs make-server-4d451974 --tail
```

---

## 📁 KEY FILE LOCATIONS

### Configuration
- **Supabase Config:** `/utils/supabase/info.tsx`
- **Main App:** `/App.tsx`
- **Backend Server:** `/supabase/functions/make-server-4d451974/index.tsx`
- **Database Utils:** `/supabase/functions/make-server-4d451974/kv_store.tsx`

### Documentation
- **Quick Deploy:** `/DEPLOY_NOW.md` ← **START HERE**
- **Current Status:** `/CURRENT_STATUS.md`
- **Full Guide:** `/DEPLOYMENT_GUIDE.md`
- **This Reference:** `/QUICK_REFERENCE.md`

### Admin Portals
- **Main Admin:** `/admin.tsx` (user management)
- **Movie Admin:** `/movie-admin.tsx` (content management)

### Components
- **Auth Modal:** `/components/AuthModal.tsx`
- **Movie Card:** `/components/MovieCard.tsx`
- **GM Social Feed:** `/components/GMSocialFeed.tsx`
- **Video Player:** `/components/VideoPlayer.tsx`

---

## 🐛 QUICK TROUBLESHOOTING

### "Failed to fetch" Error
```bash
# 1. Deploy the backend
supabase functions deploy make-server-4d451974

# 2. Wait 30 seconds

# 3. Verify
./verify-deployment.sh

# 4. Check environment variables in Supabase Dashboard
```

### Backend Deployed But Not Working
1. Check Supabase Dashboard → Edge Functions → Logs
2. Verify environment variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Restart function (redeploy)
4. Check browser console for errors

### Can't Access Admin Portal
- Click red dot **EXACTLY 6 times**
- Wait 0.5 seconds between each click
- Counter resets after 3 seconds of inactivity
- Refresh page and try again

### Movies Not Loading
1. Open browser console (F12)
2. Check for red error messages
3. Verify backend is deployed
4. Check API endpoint in Network tab
5. Verify database table exists: `kv_store_4d451974`

### Build Fails
```bash
# Clear everything and rebuild
rm -rf node_modules dist
npm cache clean --force
npm install
npm run build
```

---

## 🎯 COMMON TASKS

### Add a Movie
1. Go to your site
2. Click red dot 6x
3. Password: `0701680Kyamundu`
4. Click "Add Movie"
5. Fill in:
   - Title
   - Video URL (AWS S3 or direct link)
   - Thumbnail URL
   - Genre, Year, etc.
6. Click "Save"

### Check Server Status
```bash
# Quick check
curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health

# Should return: {"status":"ok"}
```

### View Logs
```bash
# Real-time logs
supabase functions logs make-server-4d451974 --tail

# Last 50 lines
supabase functions logs make-server-4d451974
```

### Update Frontend
```bash
# Make your changes to code
# Then rebuild
npm run build

# Upload new /dist to hosting
```

### Update Backend
```bash
# Make your changes to /supabase/functions/make-server-4d451974/
# Then redeploy
supabase functions deploy make-server-4d451974
```

---

## 🎨 CUSTOMIZATION QUICK GUIDE

### Change Color Scheme
- **File:** `/styles/globals.css`
- **Look for:** CSS variables in `:root`
- **Colors:** Primary, secondary, accent, etc.

### Change Admin Password
- **File:** `/App.tsx`
- **Search for:** `ADMIN_PASSWORD`
- **Change:** Replace `'0701680Kyamundu'` with your password
- **Rebuild:** `npm run build`

### Add Custom Logo
- **File:** `/App.tsx`
- **Search for:** Logo component
- **Replace:** Image URL or SVG

### Modify Navigation
- **File:** `/components/FourTabBottomNav.tsx`
- **Tabs:** Home, 18+, Browse, KIDo, Music
- **Icons:** From `lucide-react`

---

## 📊 MONITORING & ANALYTICS

### Check User Activity
1. Admin portal → Users tab
2. Click on any user
3. View their watch/download history

### View Popular Movies
1. Admin portal → Analytics tab
2. See top movies by views/downloads
3. Recent activity feed

### Check Server Health
- **Health endpoint:** `/make-server-4d451974/health`
- **Movies count:** `/make-server-4d451974/movies`
- **GM posts count:** `/make-server-4d451974/gm-posts`

---

## 🔧 ENVIRONMENT VARIABLES

### Required in Supabase Dashboard

**Location:** Dashboard → Edge Functions → make-server-4d451974 → Settings

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `SUPABASE_URL` | `https://avvwsbiqgtjcwphadypu.supabase.co` | Hardcoded above |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (secret) | Dashboard → Settings → API |

**Note:** These are REQUIRED or backend won't work!

---

## 🆘 GETTING HELP

### Self-Service
1. Check browser console (F12)
2. Check `/CURRENT_STATUS.md`
3. Run `./verify-deployment.sh`
4. Check Supabase logs
5. Read error messages carefully

### Documentation
- **Quick Start:** `/DEPLOY_NOW.md`
- **Full Guide:** `/DEPLOYMENT_GUIDE.md`
- **Current Status:** `/CURRENT_STATUS.md`
- **AWS Setup:** `/aws-s3-setup.md`

### External Resources
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com

---

## 📱 TESTING CHECKLIST

### After Every Deployment

- [ ] Health check returns `{"status":"ok"}`
- [ ] Homepage loads without errors
- [ ] Movies display correctly
- [ ] Search works
- [ ] Video player functions
- [ ] Download works
- [ ] Admin portal opens (6 clicks)
- [ ] Can add/edit/delete movies
- [ ] GM social feed loads
- [ ] Auth system works (sign up/in)
- [ ] Mobile responsive (test on phone)

---

## 🚀 PERFORMANCE TIPS

### Video Hosting
- Use AWS S3 or CloudFlare R2
- Enable CDN for faster delivery
- Compress videos (H.264, under 2GB)
- Use `.mp4` format

### Thumbnails
- Use WebP format
- Size: 300x450px recommended
- Compress: TinyPNG or similar
- Host on CDN if possible

### Database
- Clean up old data periodically
- Monitor table size in Supabase
- Archive old watch history

---

## 💰 MONETIZATION

### Ad Networks (Since you have 18+ content)
- **PropellerAds:** https://propellerads.com
- **AdSterra:** https://adsterra.com
- Configure in Admin → Settings → Ads

### Settings Location
- Admin portal → Settings icon
- Enable/disable ads
- Set frequencies
- Add Publisher IDs

---

## 🎯 QUICK WINS

### First Week
- [ ] Deploy backend and frontend
- [ ] Add 10-20 movies
- [ ] Test all features
- [ ] Share with friends
- [ ] Get initial feedback

### First Month
- [ ] Add 50+ movies
- [ ] Setup ad network
- [ ] Optimize performance
- [ ] Promote on social media
- [ ] Monitor analytics

---

## 📞 IMPORTANT NUMBERS

- **Build Time:** ~15-30 seconds
- **Deploy Time:** ~1-2 minutes
- **Health Check Timeout:** 10 seconds
- **Video Proxy Timeout:** 5 minutes
- **Recommended Video Size:** < 2GB
- **Max Upload Size:** Depends on your S3 plan

---

## 🎓 LEARNING RESOURCES

### If You're New To...

**React:**
- https://react.dev/learn
- https://www.w3schools.com/react/

**Supabase:**
- https://supabase.com/docs/guides/getting-started
- https://supabase.com/docs/guides/functions

**Tailwind CSS:**
- https://tailwindcss.com/docs
- https://tailwindcss.com/docs/utility-first

**AWS S3:**
- https://docs.aws.amazon.com/s3/
- https://www.youtube.com/results?search_query=aws+s3+tutorial

---

## ✅ SUCCESS INDICATORS

### Your deployment is successful if:
- ✅ Health check returns 200 OK
- ✅ Homepage loads in < 3 seconds
- ✅ No console errors
- ✅ Movies display correctly
- ✅ Videos play smoothly
- ✅ Admin portal is accessible

### Your app is production-ready if:
- ✅ All features tested
- ✅ 10+ movies added
- ✅ No critical bugs
- ✅ Mobile responsive
- ✅ Fast loading times
- ✅ Ads configured (if using)

---

## 🎊 MAINTENANCE

### Daily
- Check site is loading
- Monitor user activity
- Respond to issues

### Weekly
- Add new content
- Check analytics
- Review popular movies
- Clean up spam (if any)

### Monthly
- Backup database
- Review performance
- Update dependencies
- Plan new features

---

## 💡 PRO TIPS

1. **Always test locally before deploying**
2. **Keep Supabase dashboard open during deployment**
3. **Check logs if anything goes wrong**
4. **Use browser DevTools Console (F12) for debugging**
5. **Wait 30-60 seconds after deployment before testing**
6. **Clear browser cache if changes don't appear**
7. **Test on multiple devices (desktop, mobile, tablet)**
8. **Keep admin password secure**
9. **Backup important data regularly**
10. **Monitor Supabase usage to avoid overages**

---

**Last Updated:** November 30, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

---

**Print this page and keep it nearby!** 📄✨
