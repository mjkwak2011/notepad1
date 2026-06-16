import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL!;
const authToken = process.env.TURSO_TOKEN;

const client = createClient({
  url,
  // 로컬 파일 DB는 토큰 불필요
  ...(authToken ? { authToken } : {}),
});

export async function initializeDatabase() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '제목 없음',
      content TEXT NOT NULL DEFAULT '',
      notebook_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL
    );
  `);
}

export default client;
