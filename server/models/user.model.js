const db = require('../db');

async function findAll() {
  const res = await db.query('SELECT id, name FROM users ORDER BY id');
  return res.rows;
}

async function insert(name) {
  const res = await db.query(
    'INSERT INTO users(name) VALUES($1) RETURNING id, name',
    [name]
  );
  return res.rows[0];
}

module.exports = { findAll, insert };
