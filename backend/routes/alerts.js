const express = require('express');
const { getDatabase } = require('../db/database');
const { sendTestEmail } = require('../services/emailService');
const { requirePro } = require('../middleware/requirePro');

const router = express.Router();

router.use(requirePro);

// GET /api/alerts/settings
router.get('/settings', async (req, res) => {
  const db = await getDatabase();
  const row = await db.get(
    'SELECT alert_email, threshold_days, enabled, last_alerted_at FROM alert_settings WHERE user_id = ?',
    [req.user.id],
  );
  res.json(row || { alert_email: '', threshold_days: 7, enabled: false, last_alerted_at: null });
});

// PUT /api/alerts/settings
router.put('/settings', async (req, res) => {
  const { alert_email, threshold_days, enabled } = req.body || {};
  if (!alert_email) return res.status(400).json({ error: 'alert_email is required' });

  const days = Number(threshold_days) || 7;
  const on = enabled === false || enabled === 0 ? 0 : 1;
  const db = await getDatabase();

  const existing = await db.get(
    'SELECT id FROM alert_settings WHERE user_id = ?',
    [req.user.id],
  );

  if (existing) {
    await db.run(
      'UPDATE alert_settings SET alert_email = ?, threshold_days = ?, enabled = ? WHERE user_id = ?',
      [alert_email, days, on, req.user.id],
    );
  } else {
    await db.run(
      'INSERT INTO alert_settings (user_id, alert_email, threshold_days, enabled) VALUES (?, ?, ?, ?)',
      [req.user.id, alert_email, days, on],
    );
  }

  res.json({ alert_email, threshold_days: days, enabled: on === 1 });
});

// POST /api/alerts/test — send a test email immediately
router.post('/test', async (req, res) => {
  const db = await getDatabase();
  const s = await db.get(
    'SELECT * FROM alert_settings WHERE user_id = ?',
    [req.user.id],
  );
  if (!s) return res.status(400).json({ error: 'Save your alert settings first' });

  await sendTestEmail(s.alert_email);
  res.json({ ok: true, message: `Test email sent to ${s.alert_email}` });
});

module.exports = router;
