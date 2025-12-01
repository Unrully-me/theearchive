# 🚨 FIX: Server Health Check Failed

## Problem
You're seeing this error:
```
❌ Health check failed: TypeError: Failed to fetch
This means the server is not accessible. Check Supabase Edge Functions deployment.
```

## Root Cause
Your Supabase Edge Function (backend server) is **not deployed** or not running. The GM feed and other backend features require this server to be active.

---

## ✅ SOLUTION: Deploy the Supabase Edge Function

### Option 1: Deploy via Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Edge Functions**
   - Click "Edge Functions" in the left sidebar
   - You should see a function called `server`

3. **Deploy the function**
   - Click on the `server` function
   - Click the "Deploy" button
   - Wait for deployment to complete (usually 1-2 minutes)

4. **Verify it's running**
   - The status should show as "Active" or "Deployed"
   - Test URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/make-server-4d451974/health`

---

### Option 2: Deploy via CLI (Recommended for developers)

#### Prerequisites
- Install Supabase CLI: https://supabase.com/docs/guides/cli
- Login to Supabase: `supabase login`
- Link your project: `supabase link --project-ref YOUR_PROJECT_ID`

#### Deploy Commands

**Deploy just the server function:**
```bash
supabase functions deploy server
```

**Or deploy all functions:**
```bash
supabase functions deploy
```

**Check deployment status:**
```bash
supabase functions list
```

---

## How to Find Your Project ID

1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → API
4. Look for "Project URL" - it will be: `https://YOUR_PROJECT_ID.supabase.co`
5. The `YOUR_PROJECT_ID` part is what you need

---

## Verify the Fix

After deploying, test these URLs in your browser:

1. **Health Check** (should return `{"status":"ok"}`):
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/make-server-4d451974/health
   ```

2. **GM Posts** (should return `{"success":true,"posts":[...]}`):
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/make-server-4d451974/gm-posts
   ```

Replace `YOUR_PROJECT_ID` with your actual project ID from Supabase.

---

## After Deployment

1. **Refresh your app** - The GM feed should now load
2. **Try the Quick Post feature** - Go to Admin Portal → GM Content → Quick Post
3. **The NTV Uganda link should post successfully**

---

## Still Having Issues?

### Check Environment Variables
Make sure these are set in your Supabase Edge Function:

1. Go to Supabase Dashboard → Edge Functions → server
2. Click "Settings" or "Environment Variables"
3. Verify these exist:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Check Logs
```bash
supabase functions logs server
```

Or in Supabase Dashboard:
- Edge Functions → server → Logs

---

## Quick Deploy Script

Save this as `deploy.sh` and run `bash deploy.sh`:

```bash
#!/bin/bash
echo "🚀 Deploying Supabase Edge Functions..."
supabase functions deploy server
echo "✅ Deployment complete!"
echo ""
echo "🔍 Testing health endpoint..."
sleep 3
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/server/make-server-4d451974/health
echo ""
echo "✅ If you see {\"status\":\"ok\"}, the server is working!"
```

**Remember to replace YOUR_PROJECT_ID in the script!**

---

## Summary

**The fix is simple:** Deploy your Supabase Edge Function!

1. ✅ Open Supabase Dashboard
2. ✅ Go to Edge Functions
3. ✅ Deploy the "server" function
4. ✅ Refresh your app

That's it! The GM feed will work immediately after deployment.
