const { createClient } = require('@vercel/postgres');
require('dotenv').config();

async function test() {
  const client = createClient();
  try {
    await client.connect();
    const res = await client.sql`SELECT 1 as result`;
    console.log('Success:', res.rows);
  } catch (err) {
    console.error('Connection Error:', err);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}
test();
