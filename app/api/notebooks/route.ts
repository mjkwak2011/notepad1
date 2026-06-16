import { NextResponse } from 'next/server';
import client from '@/lib/db';

export async function GET() {
  try {
    const result = await client.execute(`
      SELECT n.id, n.title, n.created_at, n.updated_at,
             COUNT(no.id) as note_count
      FROM notebooks n
      LEFT JOIN notes no ON no.notebook_id = n.id
      GROUP BY n.id
      ORDER BY n.updated_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO notebooks (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      args: [id, title || '새 노트북', now, now],
    });

    const result = await client.execute({
      sql: 'SELECT id, title, created_at, updated_at, 0 as note_count FROM notebooks WHERE id = ?',
      args: [id],
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
