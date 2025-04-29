const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const saveContactMessage = async ({ nombre, email, mensaje }) => {
  const result = await pool.query(
    'INSERT INTO contactos_bydlight (nombre, email, mensaje) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, mensaje]
  );
  return result.rows[0];
};

module.exports = { saveContactMessage };
