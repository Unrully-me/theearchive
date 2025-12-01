# 🚀 PROMPT FOR VS CODE AI ASSISTANT

Copy and paste this EXACT prompt to your VS Code AI (GitHub Copilot Chat, Cursor, etc.):

---

## PASTE THIS TO YOUR VS CODE AI:

```
I have a complete, production-ready React movie library app called "THEE ARCHIVE" that needs to be deployed. The app is 100% finished and configured - DO NOT modify any existing files.

PROJECT STATUS:
✅ All code files are complete and working
✅ Supabase backend is configured (Project ID: avvwsbiqgtjcwphadypu)
✅ Admin portal built with password: 0701680Kyamundu
✅ All dependencies are defined in package.json
✅ Build configuration is ready

ARCHITECTURE:
- Frontend: React + Tailwind CSS + TypeScript
- Backend: Supabase Edge Functions (already deployed at avvwsbiqgtjcwphadypu.supabase.co)
- Hosting: Frontend on Stellar hosting (custom domain)
- Videos: AWS S3 cloud storage

MY TASK:
Deploy this app to my Stellar hosting with my custom domain.

IMPORTANT RULES:
❌ DO NOT create new files
❌ DO NOT modify existing files
❌ DO NOT refactor code
❌ DO NOT suggest code changes
✅ ONLY help me run deployment commands
✅ ONLY guide me through the build process
✅ ONLY help me test the backend

WHAT I NEED HELP WITH:
1. Install dependencies (npm install)
2. Deploy Supabase backend to verify it's working
3. Build the production bundle (npm run build)
4. Guide me on uploading the /dist folder to Stellar hosting
5. Help me test that everything works

DEPLOYMENT STEPS I NEED:
Step 1: Test if Supabase backend is already deployed
Step 2: If not deployed, deploy it using Supabase CLI
Step 3: Install npm dependencies
Step 4: Build production bundle
Step 5: Instructions for uploading to Stellar
Step 6: Test the deployed site

IMPORTANT NOTES:
- The .gitignore file has been manually edited by me
- All documentation files (README.md, QUICK_START.md, etc.) are complete
- All configuration files (package.json, vite.config.ts, etc.) are ready
- Backend code is in /supabase/functions/server/
- Frontend code is in /App.tsx and /components/

START WITH:
First, help me test if the Supabase backend is working by running the test script: node test-backend.js

Then guide me through the deployment process step by step.
```

---

## ALTERNATIVE SHORTER VERSION:

If your AI wants a shorter prompt, use this:

```
I have a complete React app ready to deploy. DO NOT modify any files. Only help me:
1. Run: npm install
2. Deploy Supabase backend (project: avvwsbiqgtjcwphadypu)
3. Run: npm run build
4. Upload /dist to Stellar hosting
5. Test deployment

Start by running: node test-backend.js
```

---

## WHAT THIS PROMPT DOES:
✅ Tells AI the app is complete
✅ Prevents AI from modifying your files
✅ Focuses AI on deployment commands only
✅ Gives clear step-by-step tasks
✅ Protects your manual edits (.gitignore)

## WHAT TO EXPECT FROM AI:
1. It will run commands in terminal
2. It will guide you through each step
3. It will NOT touch your code files
4. It will help you test and deploy

---

## BACKUP MANUAL COMMANDS (If AI fails):

### Step 1: Test Backend
```bash
node test-backend.js
```

### Step 2: Deploy Backend (if needed)
```bash
npm install -g supabase
supabase login
supabase link --project-ref avvwsbiqgtjcwphadypu
supabase functions deploy make-server-4d451974
```

### Step 3: Build Frontend
```bash
npm install
npm run build
```

### Step 4: Upload to Stellar
- Open Stellar dashboard
- Go to File Manager
- Upload ALL files from /dist folder
- Done!

---

## IF AI TRIES TO MODIFY FILES:

**STOP IT IMMEDIATELY AND SAY:**

```
STOP. Do NOT modify any files. The app is complete and working.
Only run terminal commands to build and deploy.
Do NOT create, edit, or refactor any code files.
```

---

## SAFE AI COMMANDS YOU CAN ALLOW:

✅ `npm install`
✅ `npm run build`
✅ `npm run dev` (for testing)
✅ `node test-backend.js`
✅ `supabase login`
✅ `supabase link --project-ref avvwsbiqgtjcwphadypu`
✅ `supabase functions deploy make-server-4d451974`
✅ `curl https://avvwsbiqgtjcwphadypu.supabase.co/functions/v1/make-server-4d451974/health`

❌ NEVER ALLOW: File edits, refactoring, "improvements", "fixes"

---
