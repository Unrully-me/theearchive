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
