const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or set PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT
  // ssl: { rejectUnauthorized: false }, // enable if needed for hosted PG
});

module.exports = pool;
