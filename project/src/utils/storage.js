const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(file) {
  ensureDataDir();
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, '[]', 'utf-8');
  }
  const raw = fs.readFileSync(p, 'utf-8');
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}

function writeJSON(file, data) {
  ensureDataDir();
  const p = path.join(dataDir, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJSON, writeJSON };
