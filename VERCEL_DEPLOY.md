# Vercel deployment checklist — THE ARCHIVE

This document covers the minimal steps to deploy the current repo to Vercel and configure the custom domain `www.theearchive.online`.

## 1) Commit and push the site changes
Run from your project root (PowerShell):

```powershell
git add vercel.json
git add -A
git commit -m "Add vercel.json and deployment tweaks for Vercel"
git push origin main
```

Vercel will detect the push and automatically build and deploy the project using `npm run build`.

---

## 2) Ensure build settings in Vercel
On Vercel (Dashboard → your Project → Settings → General → Build & Development):
- Framework Preset: detect (Vite/React) or leave blank
- Build Command: npm run build
- Output Directory: build

If Vercel does not auto-detect `build` as the output dir, the `vercel.json` file at the repo root already instructs it to use `build`.

---

## 3) Environment variables (required)
The site uses Supabase / server functions. Make sure the following environment variables are set in Vercel (Dashboard → Project → Settings → Environment Variables):
- SUPABASE_URL = https://avvwsbiqgtjcwphadypu.supabase.co
- SUPABASE_ANON_KEY (if used by the frontend)
- SUPABASE_SERVICE_ROLE_KEY (only for server side Edge Functions or Server-side usage — keep secret)

Add them to the `Production` environment and any Preview/Development environments you need.

---

## 4) Add your custom domain `www.theearchive.online`
In Vercel Dashboard → Project → Domains → Add:
- Enter `www.theearchive.online` and click Add
- Vercel will provide DNS records. Typical instructions:
  - Add a CNAME for `www` pointing to `cname.vercel-dns.com` (or the specific value Vercel shows)
  - For the root/apex domain (`theearchive.online`) add an A record to `76.76.21.21` OR use an ALIAS/ANAME if supported

Example DNS (your DNS provider interface will vary):
- Name: www → Type: CNAME → Value: cname.vercel-dns.com
- Name: @ → Type: A → Value: 76.76.21.21

After adding the records, the Vercel dashboard will detect them and issue an SSL certificate automatically. When green, you can set `www.theearchive.online` as the primary domain and enable automatic HTTPS/redirects.

---

## 5) Set the domain as primary and enforce HTTPS
In Project → Domains, mark `www.theearchive.online` as the primary domain and enable the redirect from the apex (theearchive.online) to www if desired.

---

## 6) Optional: use Vercel CLI
If you prefer the CLI, after installing `npm i -g vercel` and logging in (`vercel login`), you can run:

```powershell
# Link the local project to the Vercel project (first time only)
vercel link

# Add domain to project
vercel domains add www.theearchive.online --yes

# Deploy immediately from current directory
vercel --prod
```

---

## 7) Verify
- Visit: https://www.theearchive.online (should load, with valid HTTPS)
- Check Vercel Dashboard → Deployments → latest deployment for build logs and status

---

If you'd like I can also generate the exact git commit and optionally run the Vercel CLI commands locally if you provide Vercel CLI access tokens — otherwise perform the steps above from your machine.
