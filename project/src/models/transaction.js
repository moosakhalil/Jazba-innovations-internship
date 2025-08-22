const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const FILE = 'transactions.json';

function getAll(userId) {
  const items = readJSON(FILE);
  return items.filter(t => t.userId === userId);
}

function add({ type, amount, category, description = '', date, userId }) {
  const items = readJSON(FILE);
  const item = { id: uuidv4(), type, amount: Number(amount), category, description, date, userId };
  items.push(item);
  writeJSON(FILE, items);
  return item;
}

function remove(id, userId) {
  const items = readJSON(FILE);
  const idx = items.findIndex(t => t.id === id && t.userId === userId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeJSON(FILE, items);
  return true;
}

module.exports = { getAll, add, remove };
