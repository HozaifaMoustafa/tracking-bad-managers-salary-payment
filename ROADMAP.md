# Roadmap — Hours & Salary Tracker

> A payment accountability tool for instructors and freelancers. Track sessions, calculate what you're owed, log payments, and generate evidence when managers don't pay on time.

---

## Contributors

- [HozaifaDev](https://github.com/HozaifaDev) — founder & original author
- [YoussefBastawisy](https://github.com/YoussefBastawisy) — contributor

---

## Phase 1 — Multi-User Foundation ✅

> Goal: make the app usable by anyone, not just as a local personal tool.

| Task | Status |
|---|---|
| JWT authentication (register / login / me) | ✅ Done |
| `requireAuth` middleware — all routes protected | ✅ Done |
| Unified async DB adapter (SQLite local + PostgreSQL production) | ✅ Done |
| Migrations rewritten — `users` table + `user_id` isolation on all data | ✅ Done |
| All routes and services converted to async | ✅ Done |
| Login / Register pages with redirect on 401 | ✅ Done |
| Logout button in Sidebar | ✅ Done |
| `render.yaml` — one-click deploy to Render.com with managed PostgreSQL | ✅ Done |
| `.env.example` — all variables documented | ✅ Done |

---

## Phase 2 — Make It Valuable 🚧

> Goal: deliver real accountability features that justify switching from a spreadsheet.

### 2a — Payment Accountability
| Task | Status |
|---|---|
| Overdue payment alerts (email via Nodemailer + Gmail SMTP) | ✅ Done |
| Configurable reminder schedule (threshold days, enable/disable) | ✅ Done |
| Daily cron job at 9:00 AM with 20-hour cooldown | ✅ Done |
| `/alerts` settings page in UI (save + send test alert) | ✅ Done |
| WhatsApp / Telegram reminder bot integration | 🔲 Todo |
| Public payment status page (shareable link for the manager) | 🔲 Todo |

### 2b — Documents & Evidence
| Task | Status |
|---|---|
| PDF invoice generator (per salary month) | ✅ Done |
| Invoice includes: header, summary, session table, payment history | ✅ Done |
| Download invoice button per cycle on Monthly page | ✅ Done |
| Payment demand letter PDF (professional dispute document) | ✅ Done |
| Evidence export bundle (sessions + payments + balance as a single PDF) | ⏭ Skipped — demand letter already contains full session evidence log |

### 2c — Multi-Client Support
| Task | Status |
|---|---|
| Multiple employers / clients per user | ✅ Done |
| Per-client earning rules (generic work types: hourly / per_session / milestone) | ✅ Done |
| Per-client payment tracking and balance | ✅ Done |

### 2d — UX Improvements
| Task | Status |
|---|---|
| PWA / mobile-friendly layout | ✅ Done |
| Dark/light theme toggle | ✅ Done |
| Notification bell for overdue balance | ✅ Done |
| Onboarding wizard (first-time setup guide) | ✅ Done |

---

## Phase 3 — Monetization 💰

> Goal: turn the tool into a sustainable SaaS product.

### Pricing tiers
| Tier | Features | Price |
|---|---|---|
| **Free** | 1 client, basic tracking, PDF invoices, demand letters, email alerts | $0 |
| **Pro** | Unlimited clients + everything above | ~$9/mo |
| **Team** | Manager view, multiple instructors under one organization | ~$29/mo |

> **Payment processor:** [LemonSqueezy](https://lemonsqueezy.com) — chosen over Stripe because Stripe does not natively support Egypt. LemonSqueezy acts as Merchant of Record, handles VAT globally, and pays out without requiring a US/UK entity.

### Tasks
| Task | Status |
|---|---|
| LemonSqueezy subscription billing | ✅ Done |
| Feature gating by plan — free limited to 1 client, Pro = unlimited | ✅ Done |
| `/billing` page — plan status, upgrade CTA, feature comparison table | ✅ Done |
| Webhook handler — subscription_created / updated / cancelled / expired | ✅ Done |
| "Upgrade to Pro" CTA in Sidebar + upgrade dialog in /clients | ✅ Done |
| Configure LS env vars + webhook URL in production | 🔲 Todo (deploy step) |
| Team / organization model (many instructors, one manager view) | 🔲 Todo |
| Usage analytics dashboard (admin) | 🔲 Todo |
| Landing page & marketing site | 🔲 Todo |

---

## Phase 4 — Growth & Expansion 🌍

> Longer-term ideas once the core product is solid.

| Idea | Notes |
|---|---|
| Calendar-agnostic sync (Outlook, Apple Calendar, manual ICS) | Remove Google-only dependency |
| i18n — multiple currencies and languages | Open to global markets |
| Mobile app (React Native) | Instructors are often on phones |
| API for integrations (Zapier, Make) | Let power users automate |
| Dispute escalation workflow | Auto-generate formal complaint letter |

---

## Tech Stack

| Layer | Current | Target (production) |
|---|---|---|
| Backend | Node.js 22+, Express, SQLite | Node.js 22+, Express, PostgreSQL (Render) |
| Frontend | React 18, Vite, Tailwind, TanStack Query | Same + PWA |
| Auth | JWT (bcryptjs + jsonwebtoken) | Same |
| Deploy | Local | Render.com (backend + DB) + Vercel (frontend) |

---

## How to Contribute

1. Fork the repo and clone it
2. Create a branch from `main`: `git checkout -b feature/your-feature`
3. Check the roadmap above and pick an unclaimed task
4. Open a PR and reference the task (e.g. "Implements Phase 2a — overdue alerts")
5. Keep PRs focused — one task per PR

### Local setup

```bash
# Backend
cd backend
cp ../.env.example ../.env   # fill in your values
npm install
npm run dev                  # starts on :3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                  # starts on :3000
```

No DATABASE_URL → SQLite is used automatically. No Google credentials → Calendar sync is disabled; use manual entry or ICS import instead.
