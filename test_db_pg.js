const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 as result');
    console.log('Success:', res.rows);
  } catch (err) {
    console.error('Connection Error:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}
test();
