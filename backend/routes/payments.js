const express = require('express');
const { getDatabase } = require('../db/database');

const router = express.Router();

function mapPayment(r) {
  return {
    id: r.id,
    clientId: r.client_id,
    date: r.date,
    amountEgp: r.amount_egp,
    note: r.note,
    createdAt: r.created_at,
  };
}

async function resolveDefaultClientId(db, userId) {
  const def = await db.get(
    'SELECT id FROM clients WHERE user_id = ? AND is_default = 1',
    [userId],
  );
  return def ? def.id : null;
}

router.get('/', async (req, res) => {
  const db = await getDatabase();
  const conditions = ['user_id = ?'];
  const params = [req.user.id];

  if (req.query.clientId) {
    conditions.push('client_id = ?');
    params.push(Number(req.query.clientId));
  }

  const rows = await db.all(
    `SELECT * FROM payments WHERE ${conditions.join(' AND ')} ORDER BY date DESC, id DESC`,
    params,
  );
  res.json(rows.map(mapPayment));
});

router.post('/', async (req, res) => {
  const { date, amount_egp, amountEgp, note, clientId } = req.body || {};
  const amt = amount_egp ?? amountEgp;
  if (!date || amt == null) {
    const err = new Error('date and amount_egp (or amountEgp) are required');
    err.status = 400;
    throw err;
  }

  const db = await getDatabase();
  const resolvedClientId = clientId
    ? Number(clientId)
    : await resolveDefaultClientId(db, req.user.id);

  const { lastId } = await db.run(
    'INSERT INTO payments (user_id, client_id, date, amount_egp, note) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, resolvedClientId, date, Number(amt), note || ''],
  );
  const row = await db.get('SELECT * FROM payments WHERE id = ?', [lastId]);
  res.status(201).json(mapPayment(row));
});

router.put('/:id', async (req, res) => {
  const db = await getDatabase();
  const id = parseInt(req.params.id, 10);
  const row = await db.get('SELECT * FROM payments WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (!row) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  const b = req.body || {};
  const date = b.date !== undefined ? b.date : row.date;
  const amt = b.amount_egp !== undefined
    ? Number(b.amount_egp)
    : b.amountEgp !== undefined
      ? Number(b.amountEgp)
      : row.amount_egp;
  const note = b.note !== undefined ? b.note : row.note;
  await db.run(
    'UPDATE payments SET date = ?, amount_egp = ?, note = ? WHERE id = ? AND user_id = ?',
    [date, amt, note, id, req.user.id],
  );
  const next = await db.get('SELECT * FROM payments WHERE id = ?', [id]);
  res.json(mapPayment(next));
});

router.delete('/:id', async (req, res) => {
  const db = await getDatabase();
  const id = parseInt(req.params.id, 10);
  const { changes } = await db.run(
    'DELETE FROM payments WHERE id = ? AND user_id = ?',
    [id, req.user.id],
  );
  if (changes === 0) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  res.status(204).send();
});

module.exports = router;
