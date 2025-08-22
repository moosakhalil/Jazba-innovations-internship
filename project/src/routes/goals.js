const express = require('express');
const Goal = require('../models/goal');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.use(authMiddleware);

// GET all goals
router.get('/', (req, res) => {
  const data = Goal.getAll(req.user.id);
  res.json(data);
});

// POST create goal
router.post('/', (req, res) => {
  const { goal, amountSaved = 0, goalAmount, deadline } = req.body || {};
  if (!goal || goalAmount == null || !deadline) return res.status(400).json({ message: 'goal, goalAmount, deadline required' });
  const ga = Number(goalAmount);
  const as = Number(amountSaved);
  if (!Number.isFinite(ga) || ga <= 0) return res.status(400).json({ message: 'goalAmount must be a number > 0' });
  if (!Number.isFinite(as) || as < 0) return res.status(400).json({ message: 'amountSaved must be a number >= 0' });
  if (String(goal).trim().length === 0) return res.status(400).json({ message: 'goal name is required' });
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'deadline is invalid (YYYY-MM-DD)' });
  const created = Goal.add({ goal, amountSaved, goalAmount, deadline, userId: req.user.id });
  res.status(201).json(created);
});

// PUT update goal progress
router.put('/:id', (req, res) => {
  const updates = req.body || {};
  if (updates.amountSaved != null) {
    const as = Number(updates.amountSaved);
    if (!Number.isFinite(as) || as < 0) return res.status(400).json({ message: 'amountSaved must be a number >= 0' });
  }
  if (updates.goalAmount != null) {
    const ga = Number(updates.goalAmount);
    if (!Number.isFinite(ga) || ga <= 0) return res.status(400).json({ message: 'goalAmount must be a number > 0' });
  }
  if (updates.goal != null && String(updates.goal).trim().length === 0) {
    return res.status(400).json({ message: 'goal name cannot be empty' });
  }
  if (updates.deadline != null) {
    const d = new Date(updates.deadline);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'deadline is invalid (YYYY-MM-DD)' });
  }
  const updated = Goal.update(req.params.id, req.user.id, updates);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// DELETE goal
router.delete('/:id', (req, res) => {
  const ok = Goal.remove(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

module.exports = router;
