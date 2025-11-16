# 🎬 THEE ARCHIVE - Free Ganda & Clear Movie Library

> **A Luganda movie download site with Google AdSense monetization**

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![React](https://img.shields.io/badge/React-18.2-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

---

## 🌟 Features

✅ **Movie Library Management**
- Browse movies with beautiful card-based UI
- Search functionality with 15-second ad
- Download with 50-second ad countdown
- Responsive design (mobile + desktop)

✅ **Secret Admin Portal**
- Activated by clicking red dot 6 times
- Password protected (`0701680Kyamundu`)
- Full CRUD operations (Create, Read, Update, Delete)
- Manage movies, thumbnails, descriptions

✅ **Monetization Ready**
- 15-second search ads
- 50-second download ads
- Google AdSense integration points
- Professional cinema aesthetic

✅ **Cloud Infrastructure**
- Frontend: Static hosting (Stellar)
- Backend: Supabase Edge Functions
- Videos: AWS S3 cloud storage
- Database: Supabase KV Store

---

## 🎨 Design System

**Brand Colors:**
- Gold: `#FFD700`
- Orange: `#FFA500`
- Red-Orange: `#FF4500`

**Typography:**
- Bold, modern cinema aesthetic
- Gradient text effects
- Professional movie poster layout

---

## 🚀 Quick Start

### For Users:
1. Visit the site
2. Browse or search movies
3. Click download → Watch ad → Get movie

### For Admins:
1. Click red dot on logo 6 times
2. Enter password: `0701680Kyamundu`
3. Add/edit/delete movies

---

## 📦 Tech Stack

**Frontend:**
- React 18.2
- TypeScript
- Tailwind CSS 4.0
- Lucide Icons
- Vite (build tool)

**Backend:**
- Supabase Edge Functions (Deno)
- Hono web framework
- PostgreSQL (via Supabase)

**Hosting:**
- Frontend: Stellar (custom domain)
- Backend: Supabase servers
- Videos: AWS S3

---

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
thee-archive/
├── App.tsx                      # Main React component
├── components/
│   ├── ui/                      # Shadcn UI components
│   └── figma/                   # Image components
├── utils/
│   └── supabase/
│       └── info.tsx             # Supabase credentials
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx        # Backend API
│           └── kv_store.tsx     # Database utilities
├── styles/
│   └── globals.css              # Global styles + Tailwind
├── DEPLOYMENT_GUIDE.md          # Full deployment docs
├── QUICK_START.md               # 5-minute setup guide
└── package.json
```

---

## 🔐 Security

- Admin password: `0701680Kyamundu` (client-side only)
- Supabase keys: Public anon key (safe for frontend)
- Backend: Protected by Supabase RLS policies
- Videos: Public S3 URLs or pre-signed URLs

⚠️ **Note:** Admin password is client-side only. For production, implement proper server-side authentication!

---

## 🎯 Deployment

See detailed guides:
- **Quick Deploy (5 min):** Read `/QUICK_START.md`
- **Full Setup:** Read `/DEPLOYMENT_GUIDE.md`

**TL;DR:**
```bash
npm install
npm run build
# Upload /dist to Stellar hosting
# Deploy backend to Supabase
```

---

## 🎬 Adding Movies

1. **Upload video to AWS S3:**
   ```bash
   aws s3 cp movie.mp4 s3://your-bucket/movies/ --acl public-read
   ```

2. **Get video URL:**
   ```
   https://your-bucket.s3.amazonaws.com/movies/movie.mp4
   ```

3. **Add via Admin Portal:**
   - Click red dot 6x
   - Enter password
   - Fill form with video URL
   - Add thumbnail image URL
   - Save!

---

## 💰 Monetization

### Google AdSense Integration:

**Search Ads (15 seconds):**
- User searches → Ad modal appears
- Replace countdown with AdSense code
- User waits 15s → See results

**Download Ads (50 seconds):**
- User clicks movie → Ad modal appears
- Replace countdown with AdSense code
- User waits 50s → Download starts

**Ad Code Locations:**
- Search: Line ~920 in `/App.tsx`
- Download: Line ~820 in `/App.tsx`
- Look for: `{/* REPLACE THIS WITH YOUR GOOGLE ADSENSE CODE */}`

---

## 🧪 API Reference

**Base URL:**
```
https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974
```

**Endpoints:**
- `GET /health` - Health check
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get single movie
- `POST /movies` - Add new movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

**Example:**
```javascript
// Get all movies
fetch('https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/movies', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
```

---

## 🐛 Troubleshooting

### Backend not working?
```bash
supabase functions logs make-server-4d451974
```

### Movies not loading?
1. Check browser console (F12)
2. Verify backend is deployed
3. Test: `curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health`

### Build errors?
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 🤝 Contributing

This is a private project. For modifications:
1. Make changes locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Upload to hosting

---

## 📄 License

Private project - All rights reserved

---

## 🎉 Credits

**Built for:** Ugandan cinema community  
**Tech:** React + Supabase + Tailwind CSS  
**Hosting:** Stellar + AWS S3  
**Design:** Modern cinema aesthetic with vibrant gold/orange colors

---

## 📞 Support

- **Supabase Dashboard:** https://supabase.com/dashboard/project/avvwsbiqgtjcwphadypu
- **Check Logs:** `supabase functions logs make-server-4d451974`
- **Frontend Issues:** Check browser console
- **Backend Issues:** Check Supabase function logs

---

**🚀 Ready to launch? See `/QUICK_START.md` for 5-minute deployment!**

---

Made with ❤️ for Ugandan cinema | Powered by Supabase, React & Tailwind CSS
