const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const FILE = 'subscriptions.json';

function getAll(userId) {
  const items = readJSON(FILE);
  return items.filter(s => s.userId === userId);
}

function add({ name, amount, dueDate, period = 'monthly', userId }) {
  const items = readJSON(FILE);
  const item = { id: uuidv4(), name, amount: Number(amount), dueDate, period, userId };
  items.push(item);
  writeJSON(FILE, items);
  return item;
}

function update(id, userId, updates) {
  const items = readJSON(FILE);
  const idx = items.findIndex(s => s.id === id && s.userId === userId);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    ...updates,
    amount: Number(updates.amount ?? items[idx].amount)
  };
  writeJSON(FILE, items);
  return items[idx];
}

function remove(id, userId) {
  const items = readJSON(FILE);
  const idx = items.findIndex(s => s.id === id && s.userId === userId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeJSON(FILE, items);
  return true;
}

module.exports = { getAll, add, update, remove };
