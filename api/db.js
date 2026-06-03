const { Client } = require('pg');

module.exports = async function handler(request, response) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. 테이블이 없으면 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      )
    `);

    // 2. GET 요청: 모든 데이터 반환
    if (request.method === 'GET') {
      const res = await client.query('SELECT * FROM kv_store');
      const data = {};
      res.rows.forEach(row => {
        data[row.key] = row.value;
      });
      return response.status(200).json(data);
    } 
    
    // 3. POST 요청: 특정 키의 데이터 업데이트 (또는 삭제)
    if (request.method === 'POST') {
      const { key, value } = request.body;
      if (!key) return response.status(400).json({ error: 'Key is required' });
      
      if (value === null) {
        await client.query('DELETE FROM kv_store WHERE key = $1', [key]);
      } else {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : value;
        await client.query(`
          INSERT INTO kv_store (key, value)
          VALUES ($1, $2::jsonb)
          ON CONFLICT (key)
          DO UPDATE SET value = EXCLUDED.value;
        `, [key, valStr]);
      }
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: error.message });
  } finally {
    try { await client.end(); } catch(e) {}
  }
}
