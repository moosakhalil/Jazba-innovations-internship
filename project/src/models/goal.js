const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const FILE = 'goals.json';

function getAll(userId) {
  const items = readJSON(FILE);
  return items.filter(g => g.userId === userId);
}

function add({ goal, amountSaved = 0, goalAmount, deadline, userId }) {
  const items = readJSON(FILE);
  const item = { id: uuidv4(), goal, amountSaved: Number(amountSaved) || 0, goalAmount: Number(goalAmount), deadline, userId };
  items.push(item);
  writeJSON(FILE, items);
  return item;
}

function update(id, userId, updates) {
  const items = readJSON(FILE);
  const idx = items.findIndex(g => g.id === id && g.userId === userId);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, amountSaved: Number(updates.amountSaved ?? items[idx].amountSaved), goalAmount: Number(updates.goalAmount ?? items[idx].goalAmount) };
  writeJSON(FILE, items);
  return items[idx];
}

function remove(id, userId) {
  const items = readJSON(FILE);
  const idx = items.findIndex(g => g.id === id && g.userId === userId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeJSON(FILE, items);
  return true;
}

module.exports = { getAll, add, update, remove };
