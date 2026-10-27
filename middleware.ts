import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de protecao de rotas.
 * Verifica a presenca do cookie auth-token.
 * A validacao completa do token Firebase ocorre na API /api/auth/token.
 * O middleware Edge Runtime nao suporta firebase-admin diretamente.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = Boolean(token && token.length > 0);

  const pathname = request.nextUrl.pathname;

  // Se nao autenticado e tentando acessar rota protegida, redireciona para login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create/:path*',
    '/videos/:path*',
    '/presets/:path*',
    '/settings/:path*',
  ],
};
