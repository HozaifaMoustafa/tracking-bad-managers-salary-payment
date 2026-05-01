const nodemailer = require('nodemailer');

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendOverdueAlert({ to, overdueMonths, totalBalance }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[alerts] SMTP not configured — skipping email');
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const rows = overdueMonths
    .map(
      (m) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${m.cyclePeriod}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${m.expectedEarnings.toLocaleString()} EGP</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#ef4444;font-weight:600">${m.runningBalance.toLocaleString()} EGP</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${m.daysOverdue}d overdue</td>
        </tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#ef4444">Overdue Salary Alert</h2>
      <p>You have <strong>${totalBalance.toLocaleString()} EGP</strong> in unpaid salary across ${overdueMonths.length} cycle(s).</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px 12px;text-align:left">Cycle</th>
            <th style="padding:8px 12px;text-align:right">Earned</th>
            <th style="padding:8px 12px;text-align:right">Unpaid</th>
            <th style="padding:8px 12px;text-align:right">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;color:#6b7280;font-size:13px">
        Sent by your Salary Tracker. To stop alerts, update your notification settings.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: `Overdue Salary Alert — ${totalBalance.toLocaleString()} EGP unpaid`,
    html,
  });

  return true;
}

async function sendTestEmail(to) {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('SMTP is not configured on the server. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to your .env file.');
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to,
    subject: 'Salary Tracker — test email',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#4f46e5">Email alerts are working!</h2>
        <p>This is a test from your Salary Tracker. Your alert email is configured correctly.</p>
        <p style="color:#6b7280;font-size:13px">
          You'll receive alerts at this address when salary payments are overdue.
        </p>
      </div>
    `,
  });
}

module.exports = { sendOverdueAlert, sendTestEmail };
