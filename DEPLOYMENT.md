# Vercel Deployment Guide - BIJUTERII Romania Lux

## 🚀 Quick Start: Deploy to Vercel

This guide will help you fix the 404 deployment error and get your site working on Vercel.

---

## ✅ What's Already Done

1. **`vercel.json`** - Configuration file created ✓
2. **`.env.example`** - Environment variables template created ✓
3. **Build setup** - Vite + TanStack Start configured ✓

---

## 🔧 Step-by-Step Deployment Fix

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `robertromania2020-hub/bijuterii-romania-lux`
4. Click **"Import"**

### Step 2: Configure Project Settings

1. **Project Name**: Leave as default or customize
2. **Framework Preset**: Select **"Other"** (since this is TanStack Start)
3. **Root Directory**: Leave empty (default)

### Step 3: Set Environment Variables

In Vercel Project Settings → **Environment Variables**, add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

*(Replace with your actual Supabase credentials when ready)*

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

---

## 🔍 Troubleshooting: If You Still See 404

### Check Build Logs

1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Check the **"Build"** tab for errors

### Common Issues & Fixes

#### Issue: "Cannot find build output"
**Solution**: The `vercel.json` already points to `.output` (correct for TanStack Start)

#### Issue: "Module not found errors"
**Solution**: Run locally to test:
```bash
npm install
npm run build
```

#### Issue: "Node version mismatch"
**Solution**: Vercel defaults to Node 20.x (already configured in `vercel.json`)

---

## 🖥️ Test Locally Before Deploying

```bash
# Clone the repo
git clone https://github.com/robertromania2020-hub/bijuterii-romania-lux.git
cd bijuterii-romania-lux

# Install dependencies
npm install

# Build
npm run build

# Preview production build
npm run preview
```

If the build succeeds locally, it will work on Vercel.

---

## 📋 Vercel.json Configuration Explained

```json
{
  "buildCommand": "npm run build",      // Run Vite build
  "outputDirectory": ".output",          // TanStack Start output
  "framework": "other",                  // Custom framework
  "nodeVersion": "20.x"                  // Node.js version
}
```

---

## 🔐 Security Best Practices

1. **Never commit `.env`** - Only `.env.example` should be in git
2. **Add to `.gitignore`**:
   ```
   .env
   .env.local
   .env.*.local
   ```
3. **Use Vercel's Environment Variables** for production secrets
4. **Enable Branch Protection** in GitHub Settings

---

## 📊 Expected Build Output

After running `npm run build`, you should see:

```
.output/
├── public/
├── server/
└── [other build artifacts]
```

Vercel will automatically serve this.

---

## ✨ Next Steps After Deployment

1. **Add custom domain** (optional)
2. **Set up Supabase** for database
3. **Connect payment gateway** (Stripe, etc.)
4. **Enable HTTPS** (automatic with Vercel)

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **TanStack Start**: https://tanstack.com/start
- **Check Deployment Logs**: Vercel Dashboard → Deployments → Build Logs

---

## ✅ Verification Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables added
- [ ] Build completes successfully
- [ ] Site loads without 404 error
- [ ] All pages are accessible
- [ ] No console errors

Once all items are checked, your deployment is complete! 🎉
