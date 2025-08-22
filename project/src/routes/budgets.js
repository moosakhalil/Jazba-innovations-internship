const express = require('express');
const Budget = require('../models/budget');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// GET all budgets
router.get('/', (req, res) => {
  res.json(Budget.getAll(req.user.id));
});

// POST create budget
router.post('/', (req, res) => {
  const { category, limit } = req.body || {};
  if (!category || String(category).trim().length === 0) return res.status(400).json({ message: 'category required' });
  const lim = Number(limit);
  if (!Number.isFinite(lim) || lim <= 0) return res.status(400).json({ message: 'limit must be a number > 0' });
  const created = Budget.add({ category: String(category).trim(), limit: lim, userId: req.user.id });
  res.status(201).json(created);
});

// PUT update budget
router.put('/:id', (req, res) => {
  const updates = req.body || {};
  if (updates.category != null && String(updates.category).trim().length === 0) {
    return res.status(400).json({ message: 'category cannot be empty' });
  }
  if (updates.limit != null) {
    const lim = Number(updates.limit);
    if (!Number.isFinite(lim) || lim <= 0) return res.status(400).json({ message: 'limit must be a number > 0' });
  }
  const updated = Budget.update(req.params.id, req.user.id, updates);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// DELETE budget
router.delete('/:id', (req, res) => {
  const ok = Budget.remove(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

module.exports = router;
