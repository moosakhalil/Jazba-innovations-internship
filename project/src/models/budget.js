const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const FILE = 'budgets.json';

function getAll(userId) {
  const items = readJSON(FILE);
  return items.filter(b => b.userId === userId);
}

function add({ category, limit, userId }) {
  const items = readJSON(FILE);
  const item = { id: uuidv4(), category, limit: Number(limit), userId };
  items.push(item);
  writeJSON(FILE, items);
  return item;
}

function update(id, userId, updates) {
  const items = readJSON(FILE);
  const idx = items.findIndex(b => b.id === id && b.userId === userId);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, limit: Number(updates.limit ?? items[idx].limit) };
  writeJSON(FILE, items);
  return items[idx];
}

function remove(id, userId) {
  const items = readJSON(FILE);
  const idx = items.findIndex(b => b.id === id && b.userId === userId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeJSON(FILE, items);
  return true;
}

module.exports = { getAll, add, update, remove };
