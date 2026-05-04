const { getDatabase } = require('../db/database');

async function requirePro(req, res, next) {
  const db = await getDatabase();
  const user = await db.get('SELECT plan FROM users WHERE id = ?', [req.user.id]);
  if ((user?.plan || 'free') !== 'pro') {
    return res.status(403).json({
      error: 'This feature requires a Pro plan.',
      code: 'upgrade_required',
    });
  }
  next();
}

module.exports = { requirePro };
