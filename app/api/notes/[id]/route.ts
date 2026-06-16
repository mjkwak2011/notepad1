import { NextResponse } from 'next/server';
import client from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const args: (string | null)[] = [];

    if ('title' in body) { fields.push('title = ?'); args.push(body.title); }
    if ('content' in body) { fields.push('content = ?'); args.push(body.content); }
    if ('notebook_id' in body) { fields.push('notebook_id = ?'); args.push(body.notebook_id ?? null); }

    fields.push('updated_at = ?');
    args.push(now, params.id);

    await client.execute({
      sql: `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });

    const result = await client.execute({
      sql: 'SELECT * FROM notes WHERE id = ?',
      args: [params.id],
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await client.execute({
      sql: 'DELETE FROM notes WHERE id = ?',
      args: [params.id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
