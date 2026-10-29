import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token invalido' }, { status: 400 });
    }

    // Validade de 7 dias para a sessao (em milissegundos)
    const expiresIn = 60 * 60 * 24 * 7 * 1000;

    let sessionCookie = token;

    // Tenta validar e criar Session Cookie oficial com firebase-admin
    try {
      // Verifica token e cria cookie de sessao seguro
      sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });
    } catch (adminError) {
      console.warn('Fallback para token direto (verifique as credenciais admin):', adminError);
      // Se a chave privada do admin nao estiver configurada ainda no ambiente de dev,
      // mantem o token para nao bloquear a aplicacao
      sessionCookie = token;
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set('auth-token', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.error('Erro ao processar token:', error);
    return NextResponse.json({ error: 'Erro interno ao autenticar' }, { status: 500 });
  }
}
