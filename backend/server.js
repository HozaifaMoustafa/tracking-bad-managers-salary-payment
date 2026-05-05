require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');
const { getDatabase } = require('./db/database');

const cron = require('node-cron');
const { checkAndSendAlerts } = require('./services/alertService');

const authRouter = require('./routes/auth');
const sessionsRouter = require('./routes/sessions');
const paymentsRouter = require('./routes/payments');
const calendarRouter = require('./routes/calendar');
const syncRouter = require('./routes/sync');
const reportsRouter = require('./routes/reports');
const configRouter = require('./routes/config');
const importRouter = require('./routes/import');
const adminRouter = require('./routes/admin');
const alertsRouter = require('./routes/alerts');
const clientsRouter = require('./routes/clients');
const { router: billingRouter, handleWebhook: billingWebhook } = require('./routes/billing');
const notificationsRouter = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));

// Webhook must be registered before express.json() so we can read the raw body for HMAC verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhook);

app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Public auth routes
app.use('/api/auth', authRouter);

// All routes below require a valid JWT
app.use('/api/sessions', requireAuth, sessionsRouter);
app.use('/api/payments', requireAuth, paymentsRouter);
app.use('/api/calendar', requireAuth, calendarRouter);
app.use('/api/sync', requireAuth, syncRouter);
app.use('/api/reports', requireAuth, reportsRouter);
app.use('/api/config', requireAuth, configRouter);
app.use('/api/import', requireAuth, importRouter);
app.use('/api/admin', requireAuth, adminRouter);
app.use('/api/alerts', requireAuth, alertsRouter);
app.use('/api/clients', requireAuth, clientsRouter);
app.use('/api/billing', requireAuth, billingRouter);
app.use('/api/notifications', requireAuth, notificationsRouter);

app.use(errorHandler);

async function start() {
  await getDatabase(); // run migrations before accepting requests
  app.listen(PORT, () => {
    console.log(`Hours Tracker API listening on http://localhost:${PORT}`);
  });

  // Run overdue alert check daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    checkAndSendAlerts().catch((err) => console.error('[alerts] cron error:', err));
  });
  console.log('[alerts] Daily check scheduled at 09:00');
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
