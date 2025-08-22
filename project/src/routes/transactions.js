const express = require('express');
const Transaction = require('../models/transaction');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.use(authMiddleware);

// GET all
router.get('/', (req, res) => {
  const data = Transaction.getAll(req.user.id);
  res.json(data);
});

// POST add
router.post('/', (req, res) => {
  const { type, amount, category, description, date } = req.body || {};
  if (!type || amount == null || !category || !date) return res.status(400).json({ message: 'type, amount, category, date required' });
  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'type must be income or expense' });
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'amount must be a number > 0' });
  if (String(category).trim().length === 0) return res.status(400).json({ message: 'category is required' });
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'date is invalid (YYYY-MM-DD)' });
  const today = new Date(); today.setHours(0,0,0,0); d.setHours(0,0,0,0);
  if (type === 'expense' && d > today) return res.status(400).json({ message: 'expense date cannot be in the future' });
  const created = Transaction.add({ type, amount, category, description, date, userId: req.user.id });
  res.status(201).json(created);
});

// DELETE by id
router.delete('/:id', (req, res) => {
  const ok = Transaction.remove(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

module.exports = router;
