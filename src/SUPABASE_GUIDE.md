# 🎬 THEE ARCHIVE - ADD MOVIES (FIXED FOR REAL!)

## 🚨 EXACT STEPS - FOLLOW THESE EXACTLY

### Step 1: Open Your Table
1. Go to https://app.supabase.com
2. Click your project
3. Click **"Table Editor"** (left menu)
4. Click table **`kv_store_4d451974`**

---

### Step 2: Insert New Row
Click the green **"Insert row"** button (top right)

A popup appears with fields.

---

### Step 3: Fill the KEY field

In the **key** field, type EXACTLY this:

```
movie:1
```

(No quotes, just type it plain)

---

### Step 4: Fill the VALUE field

**CLICK INSIDE THE VALUE FIELD**

Then paste EXACTLY this (copy the whole thing):

```
{"id":"1","title":"Bad Black","description":"Action movie","videoUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ","thumbnailUrl":"","genre":"Action","year":"2016","type":"movie","createdAt":"2024-11-12T10:30:00.000Z"}
```

**IMPORTANT:**
- ✅ NO quotes around it
- ✅ Just paste the JSON directly
- ✅ It should look like `{"id":"1",...}` in the field

---

### Step 5: Click "Save"

If you get an error, tell me the EXACT error message!

---

## 🔥 ALTERNATIVE METHOD (If above fails)

### Use the SQL Editor Instead:

1. Click **"SQL Editor"** (left menu)
2. Click **"New query"**
3. Paste this EXACT code:

```sql
INSERT INTO kv_store_4d451974 (key, value)
VALUES (
  'movie:1',
  '{"id":"1","title":"Bad Black","description":"Action movie from Uganda","videoUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ","thumbnailUrl":"","genre":"Action","year":"2016","type":"movie","createdAt":"2024-11-12T10:30:00.000Z"}'::jsonb
);
```

4. Click **"Run"** (bottom right)

**BOOM! Should work! 💥**

---

## 📝 To Add More Movies (SQL Method):

```sql
INSERT INTO kv_store_4d451974 (key, value)
VALUES (
  'movie:2',
  '{"id":"2","title":"Queen of Katwe","description":"Chess champion story","videoUrl":"https://www.youtube.com/embed/VIDEO_ID","thumbnailUrl":"","genre":"Drama","year":"2016","type":"movie","createdAt":"2024-11-12T10:30:00.000Z"}'::jsonb
);
```

Just change:
- `movie:2` to `movie:3`, `movie:4`, etc.
- `"id":"2"` to match the number
- Update title, description, videoUrl, genre, year

---

## 🎥 VIDEO URL FORMATS

**Google Drive:**
```
https://drive.google.com/file/d/YOUR_FILE_ID/preview
```

**YouTube:**
```
https://www.youtube.com/embed/YOUR_VIDEO_ID
```

**Vimeo:**
```
https://player.vimeo.com/video/YOUR_VIDEO_ID
```

---

## ✅ QUICK TEST

Run this SQL to test:

```sql
INSERT INTO kv_store_4d451974 (key, value)
VALUES (
  'movie:999',
  '{"id":"999","title":"Test Movie","description":"Testing","videoUrl":"https://www.youtube.com/embed/test","thumbnailUrl":"","genre":"Drama","year":"2024","type":"movie","createdAt":"2024-11-12T10:30:00.000Z"}'::jsonb
);
```

---

## 🔗 Short Links

You can generate a short link for any movie URL from the Admin Portal. Click **Generate Short Link** after entering the AWS/YouTube URL — the backend stores the mapping under `short:<code>` in the KV table and returns the `https://yourdomain.com/s/<code>` link. Short links redirect to the original URL and can be used for sharing.

Tracking short link visits
--------------------------
- When a user visits `/s/<code>` the system now increments a counter in your KV store. The key is `short:visits:<code>` and contains an object like `{ count: number, lastVisit: ISOString }`.
- You can query stats from the function with `GET /shorts/<code>/stats` (or with the function prefix: `/make-server-4d451974/shorts/<code>/stats`).
- From the Supabase dashboard you can also query `kv_store_4d451974` and search for keys prefixed with `short:visits:`.

Google Analytics (optional)
 
 Environment variable (recommended)
 ---------------------------------
 To configure this in production without hardcoding the ID, set the Vite env var `VITE_GA_ID` to your `G-...` Measurement ID on your hosting provider (e.g., Vercel). This avoids putting secrets/IDs directly into source:
 
 - On Vercel: set `VITE_GA_ID` in Project Settings → Environment Variables
 - On other hosts: set `VITE_GA_ID` in the build env
 
 The code falls back to `G-C42E9WGM8K` if no env var is defined.

ads.txt & robots.txt (authorize your publisher)
----------------------------------------------
- Add `public/ads.txt` to authorize your AdSense publisher. Example content for `ads.txt`:

  google.com, pub-5559193988562698, DIRECT, f08c47fec0942fa0

- Make `robots.txt` generally permissive for `AdsBot-Google` and `Mediapartners-Google` so AdSense can crawl and verify your site.

  Example `public/robots.txt`:

  User-agent: *
  Disallow:

  User-agent: AdsBot-Google
  Allow: /

  User-agent: Mediapartners-Google
  Allow: /

After updating these files, push and redeploy your site — then re-run AdSense verification.

If you want to restrict short link creation to admins, set `ADMIN_PASSWORD` as a secret in the Supabase function env. You can also change `DEPLOY_HOST` env var to have generated short links use your real domain.

If this works → Your site will show "Test Movie"!

Then you can delete it and add real movies.

---

## 🗑️ To Delete Test Movie:

```sql
DELETE FROM kv_store_4d451974 WHERE key = 'movie:999';
```

---

**TRY THE SQL METHOD - IT WORKS 100%! 🔥**
