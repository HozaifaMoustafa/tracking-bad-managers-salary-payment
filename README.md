# Hours & Salary Tracker

A **multi-user SaaS** for instructors and freelancers who want to track unpaid work and hold managers accountable. Log sessions, calculate what you're owed, record payments, generate invoices and formal demand letters, and get email alerts when salary is overdue.

- **Backend:** Node.js 22+, Express, SQLite (dev) / PostgreSQL (production), `pdfkit`, `nodemailer`, `node-cron`
- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query, React Router, Recharts
- **Billing:** [LemonSqueezy](https://lemonsqueezy.com) — free/pro subscription gating
- **Deploy:** Render.com (backend + DB) + Vercel (frontend) via `render.yaml`

---

## Features

| Feature | Free | Pro |
|---|---|---|
| Work session tracking (manual entry + ICS import) | ✅ | ✅ |
| Payment history & running balance | ✅ | ✅ |
| PDF invoice per salary cycle | ✅ | ✅ |
| Number of clients / employers | 1 | Unlimited |
| Monthly breakdown & reports | ❌ | ✅ |
| Excel export | ❌ | ✅ |
| Payment demand letter (formal dispute document + evidence log) | ❌ | ✅ |
| Overdue payment email alerts (daily cron) | ❌ | ✅ |
| Google Calendar sync | ❌ | ✅ |

---

## Prerequisites

- **Node.js 22.5+** (required for built-in `node:sqlite`)
- **npm**
- Google account + Google Cloud project with **Calendar API** enabled (optional — only for sync)

---

## Quick start

```bash
# Clone and install
git clone https://github.com/HozaifaDev/tracking-bad-managers-salary-payment
cd tracking-bad-managers-salary-payment
npm install

# Configure
cp .env.example .env
# Fill in .env (at minimum: JWT_SECRET)

# Run (backend :3001 + frontend :5173)
npm run dev
```

Open **http://localhost:5173**, register an account, and you're in.

---

## Configuration — `.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default `3001`) |
| `NODE_ENV` | No | `development` shows error stacks |
| `DB_PATH` | No | SQLite file path, relative to `backend/` (default `./tracker.db`) |
| `DATABASE_URL` | No | PostgreSQL connection string — if set, SQLite is not used |
| `JWT_SECRET` | **Yes** | Long random string for signing tokens |
| `SMTP_HOST` | No | SMTP server for email alerts (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_USER` | No | SMTP login email |
| `SMTP_PASS` | No | SMTP password or app password |
| `SMTP_FROM` | No | From address shown in alert emails |
| `LEMONSQUEEZY_API_KEY` | No | LS API key — from Settings → API |
| `LEMONSQUEEZY_STORE_ID` | No | LS store ID — from Settings → Stores |
| `LEMONSQUEEZY_VARIANT_ID` | No | Pro plan variant ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | No | Webhook signing secret from LS dashboard |
| `APP_URL` | No | Public frontend URL (used for checkout redirect, default `http://localhost:5173`) |
| `GOOGLE_CALENDAR_ID` | No | Calendar ID for Google sync |

LemonSqueezy variables are only required if you want paid subscriptions. The app runs fully without them (all users are treated as free).

---

## Authentication

Anyone who can reach the URL can register. Each user's data (sessions, payments, clients) is fully isolated. JWTs expire after 7 days.

> In production, restrict registration via network access or add invite-only logic if needed.

---

## Clients & work types

Each user can have multiple **clients** (employers / projects). Each client has its own:
- Currency and billing cycle start day
- **Work types** — define how earnings are calculated:
  - `hourly` — rate × hours worked
  - `per_session` — flat amount per session
  - `milestone` — fixed payout triggered when marked complete

Switch between clients from the sidebar dropdown. All sessions, payments, invoices, and alerts are scoped to the active client.

> **Free plan:** 1 client. **Pro plan:** unlimited clients.

---

## Google Calendar sync

1. [Google Cloud Console](https://console.cloud.google.com/) → enable **Google Calendar API**
2. Create an **OAuth client (Desktop app)** → download JSON → save as `backend/credentials.json`
3. Run one-time auth:
   ```bash
   cd backend && npm run auth
   ```
4. Go to **Sync** in the app and pick a date range.

Re-sync never duplicates sessions — existing `calendar_event_id` rows are skipped. All-day events are ignored.

Sessions are matched to work types by name. Anything unmatched is flagged with 0 earnings for manual review.

---

## Email alerts

1. Add SMTP credentials to `.env`
2. Go to **Alerts** in the sidebar
3. Enter your email, set the overdue threshold (days), and save
4. Click **Send test alert** to verify

The server checks every morning at **9:00 AM** and emails you if any salary cycle is unpaid past your threshold.

---

## PDF documents

| Document | How to get it |
|---|---|
| **Invoice** | Monthly page → download icon on any cycle row |
| **Demand letter** | Monthly page → "Download demand letter" — covers all overdue cycles with full session evidence |

---

## Billing cycle

Default: each salary month runs from the **25th** of the previous calendar month through the **24th** of the named month. Configurable per client via **cycle start day**.

Example: **Nov 25 – Dec 24** = salary month **December**.

---

## LemonSqueezy billing setup

1. Create a product + variant in your LemonSqueezy dashboard
2. Set up a webhook pointing to `https://your-domain.com/api/billing/webhook`
   - Events to subscribe: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`
3. Fill in the four `LEMONSQUEEZY_*` vars in `.env`

When a user upgrades, LemonSqueezy fires the webhook and the app sets their plan to `pro` immediately.

---

## UI pages

| Page | Purpose |
|---|---|
| **Dashboard** | Balance, charts (expected vs paid per month, cumulative), recent sessions |
| **Sessions** | Add, edit, delete, filter, and paginate work sessions |
| **Payments** | Log payments received; running total column |
| **Monthly** | Per-cycle breakdown — download invoice or demand letter per cycle |
| **Sync** | Google Calendar sync with date range and sync log |
| **Clients** | Add/edit/delete clients; configure work types, currency, cycle day |
| **Alerts** | Configure overdue email alerts |
| **Settings** | Danger zone (reset data) |
| **Billing** | Current plan, upgrade to Pro, manage subscription |

---

## API reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user (includes `plan`) |

### Clients
| Method | Path | Description |
|---|---|---|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create client (free: max 1) |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client (must have no sessions/payments) |
| POST | `/api/clients/:id/default` | Set as default client |

### Sessions & Payments
| Method | Path | Description |
|---|---|---|
| GET | `/api/sessions` | List sessions (query: `page`, `clientId`, `from`, `to`, `category`, `salaryMonth`, `search`, `flagged`) |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |
| GET | `/api/payments` | List payments (`?clientId=`) |
| POST | `/api/payments` | Record payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Reports
| Method | Path | Description |
|---|---|---|
| GET | `/api/reports/summary` | Dashboard totals (`?clientId=`) |
| GET | `/api/reports/monthly` | Monthly breakdown array |
| GET | `/api/reports/export` | Excel download |
| GET | `/api/reports/invoice` | PDF invoice (`?month=&clientId=`) |
| GET | `/api/reports/demand-letter` | PDF demand letter (`?clientId=`) |

### Calendar & Sync
| Method | Path | Description |
|---|---|---|
| POST | `/api/calendar/sync` | Sync from Google Calendar (`{ from, to }`) |
| GET | `/api/calendar/status` | `hasToken`, `hasCredentials` |
| GET | `/api/sync/log` | Last 10 sync records |

### Alerts
| Method | Path | Description |
|---|---|---|
| GET | `/api/alerts/settings` | Get alert config |
| PUT | `/api/alerts/settings` | Save alert config |
| POST | `/api/alerts/test` | Send test alert now |

### Billing
| Method | Path | Description |
|---|---|---|
| GET | `/api/billing/status` | Current plan + subscription status |
| POST | `/api/billing/checkout` | Create LemonSqueezy checkout URL |
| POST | `/api/billing/portal` | Get customer portal URL (pro users) |
| POST | `/api/billing/webhook` | LemonSqueezy webhook (HMAC-verified) |

---

## Project layout

```
tracking-bad-managers-salary-payment/
├── .env                    ← your config (gitignored)
├── .env.example
├── render.yaml             ← one-click Render.com deploy
├── backend/
│   ├── server.js
│   ├── db/
│   │   ├── database.js     ← adapter dispatcher (SQLite or PostgreSQL)
│   │   ├── migrations.js   ← all table schemas, idempotent
│   │   ├── sqlite.js
│   │   └── pg.js
│   ├── middleware/
│   │   ├── auth.js         ← JWT requireAuth
│   │   └── errorHandler.js
│   ├── routes/             ← auth, clients, sessions, payments, reports,
│   │                          calendar, sync, alerts, billing, config, import, admin
│   ├── services/           ← balancer, calculator, invoice, demandLetter,
│   │                          sessionSync, calendar, email, alert, lemonSqueezy
│   └── scripts/googleAuth.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/ClientContext.jsx
        ├── lib/            ← api.js, auth.js, utils.js
        ├── components/     ← Layout, Sidebar, ui/
        └── pages/          ← Dashboard, Sessions, Payments, Monthly,
                               Sync, Clients, Alerts, Settings, Billing
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `credentials.json not found` | Save OAuth JSON as `backend/credentials.json` |
| `Google Calendar not connected` | Run `cd backend && npm run auth` |
| `node:sqlite is not available` | Upgrade to Node 22.5+ |
| Broken `node_modules` / EPERM | Delete all `node_modules` + `package-lock.json`, re-run `npm install` |
| EPERM on Windows with OneDrive | Pause OneDrive sync for this folder, or run terminal as Administrator |
| Checkout button does nothing | Fill in `LEMONSQUEEZY_*` env vars |

---

## Contributors

- [HozaifaDev](https://github.com/HozaifaDev) — founder & original author
- [YoussefBastawisy](https://github.com/YoussefBastawisy) — contributor

---

## License

Personal use — adapt freely for your own workflow.
