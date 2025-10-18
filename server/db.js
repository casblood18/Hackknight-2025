import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or set PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT
  // ssl: { rejectUnauthorized: false }, // enable if needed for hosted PG
});

export default pool;
