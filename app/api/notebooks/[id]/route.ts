import { NextResponse } from 'next/server';
import client from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { title } = await request.json();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE notebooks SET title = ?, updated_at = ? WHERE id = ?',
      args: [title, now, params.id],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM notebooks WHERE id = ?',
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
      sql: 'DELETE FROM notebooks WHERE id = ?',
      args: [params.id],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
