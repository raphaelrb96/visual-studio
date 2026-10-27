import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token invalido' }, { status: 400 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
