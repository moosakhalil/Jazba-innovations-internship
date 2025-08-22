const { readJSON, writeJSON } = require('../utils/storage');
const bcrypt = require('bcryptjs');
const FILE = 'users.json';

function findByUsername(username) {
  const users = readJSON(FILE);
  return users.find(u => u.username === username) || null;
}

function createUser({ username, password }) {
  const users = readJSON(FILE);
  if (users.find(u => u.username === username)) {
    throw new Error('User exists');
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = { id: username, username, passwordHash: hash };
  users.push(user);
  writeJSON(FILE, users);
  return { id: user.id, username: user.username };
}

module.exports = { findByUsername, createUser };
