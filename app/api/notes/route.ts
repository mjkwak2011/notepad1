import { NextResponse } from 'next/server';
import client from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM notes';
    const args: (string | null)[] = [];
    const conditions: string[] = [];

    if (notebookId) {
      conditions.push('notebook_id = ?');
      args.push(notebookId);
    }
    if (search) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      args.push(`%${search}%`, `%${search}%`);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY updated_at DESC';

    const result = await client.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, notebook_id } = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO notes (id, title, content, notebook_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, title || '제목 없음', content || '', notebook_id ?? null, now, now],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM notes WHERE id = ?',
      args: [id],
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
