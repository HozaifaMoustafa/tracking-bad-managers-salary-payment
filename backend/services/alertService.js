const { parse, differenceInDays } = require('date-fns');
const { getDatabase } = require('../db/database');
const { getMonthlyBreakdown } = require('./balancerService');
const { sendOverdueAlert } = require('./emailService');

async function checkAndSendAlerts() {
  const db = await getDatabase();
  const settings = await db.all(
    'SELECT * FROM alert_settings WHERE enabled = 1',
    [],
  );

  if (settings.length === 0) return;

  const today = new Date();

  for (const s of settings) {
    const cooldownHours = 20;
    if (s.last_alerted_at) {
      const lastAlert = parse(s.last_alerted_at, "yyyy-MM-dd'T'HH:mm:ss", new Date());
      const hoursSince = (today - lastAlert) / 1000 / 3600;
      if (hoursSince < cooldownHours) continue;
    }

    const breakdown = await getMonthlyBreakdown(db, s.user_id);
    const overdueMonths = breakdown
      .filter((m) => {
        if (m.runningBalance <= 0) return false;
        const cycleEnd = parse(m.cycleEnd, 'yyyy-MM-dd', new Date());
        const daysOverdue = differenceInDays(today, cycleEnd);
        return daysOverdue >= s.threshold_days;
      })
      .map((m) => ({
        ...m,
        daysOverdue: differenceInDays(today, parse(m.cycleEnd, 'yyyy-MM-dd', new Date())),
      }));

    if (overdueMonths.length === 0) continue;

    const totalBalance = overdueMonths.reduce((sum, m) => sum + m.runningBalance, 0);
    const totalBalance2 = Math.round(totalBalance * 100) / 100;

    const sent = await sendOverdueAlert({
      to: s.alert_email,
      overdueMonths,
      totalBalance: totalBalance2,
    });

    if (sent) {
      const now = today.toISOString().replace('T', 'T').slice(0, 19);
      await db.run(
        'UPDATE alert_settings SET last_alerted_at = ? WHERE user_id = ?',
        [now, s.user_id],
      );
      console.log(`[alerts] Sent overdue alert to ${s.alert_email} (user ${s.user_id})`);
    }
  }
}

module.exports = { checkAndSendAlerts };
