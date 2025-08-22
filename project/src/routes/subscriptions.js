const express = require('express');
const Subscription = require('../models/subscription');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// GET all subscriptions
router.get('/', (req, res) => {
  res.json(Subscription.getAll(req.user.id));
});

// POST create subscription
router.post('/', (req, res) => {
  const { name, amount, dueDate, period = 'monthly' } = req.body || {};
  if (!name || String(name).trim().length === 0) return res.status(400).json({ message: 'name required' });
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'amount must be a number > 0' });
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'dueDate invalid (YYYY-MM-DD)' });
  const created = Subscription.add({ name: String(name).trim(), amount: amt, dueDate, period, userId: req.user.id });
  res.status(201).json(created);
});

// PUT update subscription
router.put('/:id', (req, res) => {
  const updates = req.body || {};
  if (updates.name != null && String(updates.name).trim().length === 0) return res.status(400).json({ message: 'name cannot be empty' });
  if (updates.amount != null) {
    const amt = Number(updates.amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'amount must be a number > 0' });
  }
  if (updates.dueDate != null) {
    const d = new Date(updates.dueDate);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'dueDate invalid (YYYY-MM-DD)' });
  }
  const updated = Subscription.update(req.params.id, req.user.id, updates);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// DELETE subscription
router.delete('/:id', (req, res) => {
  const ok = Subscription.remove(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

module.exports = router;
