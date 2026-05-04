const express = require('express');
const { getDatabase } = require('../db/database');
const { getAllTimeSummary, getMonthlyBreakdown } = require('../services/balancerService');
const { buildWorkbook } = require('../services/reportService');
const { buildInvoicePdf } = require('../services/invoiceService');
const { buildDemandLetterPdf } = require('../services/demandLetterService');
const { requirePro } = require('../middleware/requirePro');

const router = express.Router();

function parseClientId(query) {
  const v = query.clientId;
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

router.get('/summary', async (req, res) => {
  const db = await getDatabase();
  const clientId = parseClientId(req.query);
  res.json(await getAllTimeSummary(db, req.user.id, clientId));
});

router.get('/monthly', requirePro, async (req, res) => {
  const db = await getDatabase();
  const clientId = parseClientId(req.query);
  res.json(await getMonthlyBreakdown(db, req.user.id, clientId));
});

router.get('/export', requirePro, async (req, res) => {
  const { from, to } = req.query;
  const clientId = parseClientId(req.query);
  const wb = await buildWorkbook({ from, to, userId: req.user.id, clientId });
  const buf = await wb.xlsx.writeBuffer();
  const name = `salary_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.send(Buffer.from(buf));
});

router.get('/invoice', async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: 'month query param is required' });
  const clientId = parseClientId(req.query);
  const pdf = await buildInvoicePdf({ userId: req.user.id, salaryMonth: month, clientId });
  const name = `invoice_${month.replace(/\s/g, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.send(pdf);
});

router.get('/demand-letter', requirePro, async (req, res) => {
  const clientId = parseClientId(req.query);
  const pdf = await buildDemandLetterPdf({ userId: req.user.id, clientId });
  const name = `demand_letter_${new Date().toISOString().slice(0, 10)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.send(pdf);
});

module.exports = router;
