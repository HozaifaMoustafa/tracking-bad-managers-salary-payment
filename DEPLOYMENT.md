# PayTrack — Production Deployment Guide

**Stack:** Railway (backend + PostgreSQL) + Vercel (frontend) + LemonSqueezy (billing)
**Estimated cost:** ~$5/month
**Repo:** https://github.com/HozaifaMoustafa/tracking-bad-managers-salary-payment

---

## Step 0 — Accounts needed

| Service | URL | Cost |
|---|---|---|
| Railway | https://railway.com | $5/month (Hobby plan) |
| Vercel | https://vercel.com | Free |
| LemonSqueezy | https://lemonsqueezy.com | Free (5% transaction fee) |

---

## Step 1 — Backend on Railway

### 1.1 Create project
1. Go to [railway.com](https://railway.com) → Sign in with GitHub
2. Click **New Project → Deploy from GitHub repo** → select this repo
3. Click the Node.js service → **Settings** tab:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

### 1.2 Add PostgreSQL
1. Inside the Railway project click **+ New → Database → Add PostgreSQL**
2. Railway auto-generates a `DATABASE_URL` — no action needed, it links automatically

### 1.3 Set environment variables
Click the Node.js service → **Variables** tab → add each of these:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=<Gmail App Password — Google Account → Security → App Passwords → generate one>
SMTP_FROM=PayTrack <your-gmail@gmail.com>
LEMONSQUEEZY_API_KEY=<fill after Step 3>
LEMONSQUEEZY_STORE_ID=<fill after Step 3>
LEMONSQUEEZY_VARIANT_ID_MONTHLY=<fill after Step 3>
LEMONSQUEEZY_VARIANT_ID_ANNUAL=<fill after Step 3>
LEMONSQUEEZY_WEBHOOK_SECRET=<fill after Step 3>
APP_URL=https://your-frontend.vercel.app
```

> **DATABASE_URL tip:** Use `${{Postgres.DATABASE_URL}}` exactly — Railway resolves it to the real value automatically.

> **JWT_SECRET:** Run this in any terminal to generate one:
> ```
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 1.4 Get your Railway backend URL
Service → **Settings → Networking → Generate Domain** → copy the URL.
It will look like: `https://paytrack-api.up.railway.app`

Save this URL — you need it in Steps 2 and 3.

---

## Step 2 — Frontend on Vercel

### 2.1 Create project
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New Project → Import** this repo
3. Set **Root Directory** to: `frontend`
4. Framework preset auto-detects as **Vite** ✅

### 2.2 Set environment variable on Vercel
In the Vercel project → **Settings → Environment Variables**, add:

```
VITE_API_URL=https://paytrack-api.up.railway.app
```

Replace with your actual Railway URL from Step 1.4.

### 2.3 Update `frontend/vercel.json`
Open `frontend/vercel.json` in the repo and replace the placeholder URL with your Railway URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://paytrack-api.up.railway.app/api/:path*"
    }
  ]
}
```

Commit and push the change:
```bash
git add frontend/vercel.json
git commit -m "deploy: set Railway backend URL in Vercel rewrite"
git push
```

### 2.4 Deploy
Click **Deploy** on Vercel. It builds the Vite app automatically.
Copy your Vercel URL (e.g. `https://paytrack.vercel.app`).

### 2.5 Update APP_URL on Railway
Go back to Railway → Variables → update:
```
APP_URL=https://paytrack.vercel.app
```

---

## Step 3 — LemonSqueezy Billing

### 3.1 Create your store
1. Go to [app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. **Settings → Stores → Create store** (your brand name, currency USD)
3. Copy your **Store ID**

### 3.2 Create a product
1. **Products → Add Product** → Name: "PayTrack Pro"
2. Add two **variants**:
   - **Monthly** — $5.00/month (recurring) → copy its **Variant ID**
   - **Annual** — $45.00/year (recurring) → copy its **Variant ID**

### 3.3 Register the webhook
1. **Settings → Webhooks → Add webhook**
2. URL: `https://paytrack-api.up.railway.app/api/billing/webhook`
3. Select these events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
4. Copy the **Signing Secret**

### 3.4 Get your API key
1. **Settings → API → Create API key** → copy it

### 3.5 Fill in Railway env vars
Back in Railway → Variables, fill in the values from above:
```
LEMONSQUEEZY_API_KEY=<your API key>
LEMONSQUEEZY_STORE_ID=<your store ID>
LEMONSQUEEZY_VARIANT_ID_MONTHLY=<monthly variant ID>
LEMONSQUEEZY_VARIANT_ID_ANNUAL=<annual variant ID>
LEMONSQUEEZY_WEBHOOK_SECRET=<signing secret>
```

Railway redeploys automatically after saving.

---

## Step 4 — Verify everything works

| Check | How | Expected result |
|---|---|---|
| Backend health | `GET https://paytrack-api.up.railway.app/api/health` | `{"ok":true}` |
| Frontend loads | Open your Vercel URL | Landing page shows |
| Registration | Click "Get started free" → register | Redirects to `/dashboard` |
| DB tables created | Railway logs after first boot | `Hours Tracker API listening on port ...` — no errors |
| Billing flow | `/billing` → Upgrade → checkout | LemonSqueezy checkout page opens |
| Webhook fires | Complete a test purchase | Railway logs: `[billing] subscription_created` |
| Plan upgrades | After test purchase | User plan shows as `pro` in the app |

---

## Step 5 — Custom domain (optional)

### Frontend (Vercel)
1. Buy a domain (Namecheap, GoDaddy, etc.)
2. Vercel → **Settings → Domains → Add domain**
3. Follow DNS instructions Vercel shows

### Backend (Railway)
1. Railway service → **Settings → Networking → Custom Domain**
2. Add `api.yourdomain.com`
3. Update `APP_URL` env var on Railway
4. Update `frontend/vercel.json` rewrite destination to `https://api.yourdomain.com`
5. Update LemonSqueezy webhook URL to `https://api.yourdomain.com/api/billing/webhook`

---

## Full checklist

- [ ] Railway account created, project deployed from GitHub
- [ ] PostgreSQL added to Railway project
- [ ] All environment variables set on Railway (including JWT_SECRET, SMTP)
- [ ] Backend health check returns `{"ok":true}`
- [ ] Vercel project created and deployed
- [ ] `frontend/vercel.json` updated with real Railway URL and pushed
- [ ] Frontend landing page loads correctly
- [ ] Registration and login work end-to-end
- [ ] LemonSqueezy: store created, product + 2 variants created
- [ ] LemonSqueezy webhook registered pointing to Railway
- [ ] All `LEMONSQUEEZY_*` env vars filled in Railway
- [ ] Test checkout completes and plan updates to Pro
- [ ] (Optional) Custom domain configured on both Vercel and Railway

---

**Estimated time:** 45–60 minutes  
**Monthly cost:** $5 (Railway Hobby) + $0 (Vercel free) = **$5/month total**
