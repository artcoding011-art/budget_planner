const { sql } = require('@vercel/postgres');

module.exports = async function handler(request, response) {
  try {
    // 1. 테이블이 없으면 생성
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      )
    `;

    // 2. GET 요청: 모든 데이터 반환
    if (request.method === 'GET') {
      const { rows } = await sql`SELECT * FROM kv_store`;
      const data = {};
      rows.forEach(row => {
        data[row.key] = row.value;
      });
      return response.status(200).json(data);
    } 
    
    // 3. POST 요청: 특정 키의 데이터 업데이트 (또는 삭제)
    if (request.method === 'POST') {
      const { key, value } = request.body;
      if (!key) return response.status(400).json({ error: 'Key is required' });
      
      if (value === null) {
        // value가 null이면 데이터 삭제 (초기화)
        await sql`DELETE FROM kv_store WHERE key = ${key}`;
      } else {
        // 데이터 저장 또는 덮어쓰기 (Upsert)
        // 객체인 경우 문자열(JSON)로 변환해 전달
        const valStr = typeof value === 'object' ? JSON.stringify(value) : value;
        await sql`
          INSERT INTO kv_store (key, value)
          VALUES (${key}, ${valStr}::jsonb)
          ON CONFLICT (key)
          DO UPDATE SET value = EXCLUDED.value;
        `;
      }
      return response.status(200).json({ success: true });
    }

    // 그 외의 HTTP 메서드 제한
    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: error.message });
  }
}

