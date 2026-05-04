import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const command = (body?.command ?? '').toString().trim();
    const response = `Command received: ${command}`;
    return NextResponse.json({ success: true, response });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
