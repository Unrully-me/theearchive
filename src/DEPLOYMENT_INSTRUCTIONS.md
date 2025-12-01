# 🚀 THEE ARCHIVE - Deployment Instructions

## ❌ Current Error
```
Error fetching movies: TypeError: Failed to fetch
```

This error means the Supabase Edge Function server is **NOT DEPLOYED** or **NOT ACCESSIBLE**.

## ✅ Solution: Deploy the Supabase Edge Function

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref avvwsbiqgtjcwphadypu
```

### Step 4: Deploy the Edge Function
```bash
supabase functions deploy make-server-4d451974
```

### Step 5: Set Environment Variables
After deployment, go to your Supabase Dashboard:

1. Navigate to: **Edge Functions** > **make-server-4d451974** > **Settings**
2. Add these secrets:
   - `SUPABASE_URL` = https://avvwsbiqgtjcwphadypu.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key from Supabase Dashboard > Settings > API)

### Step 6: Verify Deployment
The function should be accessible at:
```
https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

Test it in your browser or with curl:
```bash
curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
```

Expected response:
```json
{"status":"ok"}
```

## 📋 Files That Were Fixed

### ✅ Server Files (Ready for Deployment)
- `/supabase/functions/make-server-4d451974/index.tsx` - Main server with all endpoints
- `/supabase/functions/make-server-4d451974/kv_store.tsx` - Database interface
- `/supabase/config.toml` - Supabase configuration

### ✅ Frontend Files (URL Fixes Applied)
All API calls now use the correct endpoint format:
- `/App.tsx` - Movies fetching with enhanced debugging
- `/components/GMSocialFeed.tsx` - All GM endpoints fixed
- `/components/GMQuickPoster.tsx` - Admin bulk poster
- `/components/GMBulkPoster.tsx` - Bulk GM posts
- All other components already had correct URLs

## 🔍 Debugging

If deployment succeeds but you still get errors:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard > Edge Functions > make-server-4d451974 > Logs
   
2. **Verify Environment Variables:**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly

3. **Test Endpoints:**
   ```bash
   # Health check
   curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health
   
   # Movies endpoint
   curl -H "Authorization: Bearer YOUR_ANON_KEY" \
        https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/movies
   ```

4. **Check Browser Console:**
   - Open DevTools > Console
   - Look for detailed error messages with 🎬, 🏥, ✅, ❌ emojis

## 📊 What Was Fixed

### Issue #1: Incorrect API URLs
**Before:**
```
https://.../functions/v1/server/make-server-4d451974/...  ❌
```

**After:**
```
https://.../functions/v1/make-server-4d451974/...  ✅
```

Fixed in 7 locations across GMSocialFeed.tsx

### Issue #2: Missing Server Code
**Before:**
- Empty or incomplete `/supabase/functions/make-server-4d451974/index.tsx`

**After:**
- Complete server with all endpoints copied from `/supabase/functions/server/index.tsx`
- Includes: Movies, Auth, GM Social, Admin, Proxy, Streaming

### Issue #3: Missing Health Checks
**Before:**
- No way to verify if server is running

**After:**
- Health check endpoint: `/make-server-4d451974/health`
- Frontend tests health before fetching data
- Detailed console logging for debugging

## 🎯 Next Steps

After deployment, you should be able to:
- ✅ Load movies from the database
- ✅ Access GM social feed
- ✅ Upload and manage content
- ✅ Use admin portal features
- ✅ Stream and download videos

## 🆘 Still Having Issues?

If after deployment you still see errors:

1. Check the **exact error message** in browser console
2. Check **Supabase Edge Function logs** in dashboard
3. Verify the **kv_store_4d451974 table exists** in your database
4. Ensure **CORS** is not being blocked by browser
5. Try accessing endpoints directly in browser to test

---

**Project ID:** avvwsbiqgtjcwphadypu  
**Function Name:** make-server-4d451974  
**Region:** (check your Supabase project settings)
