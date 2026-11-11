import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de proteção e redirecionamento de rotas:
 * 1. Usuário não autenticado tentando acessar rota privada -> redireciona para a Landing Page (/).
 * 2. Usuário autenticado acessando páginas públicas de entrada (/, /login, /register) -> redireciona para /dashboard.
 */

// Rotas que exigem autenticação obrigatória
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/create',
  '/videos',
  '/presets',
  '/settings',
  '/templates',
];

// Páginas públicas que redirecionam para dashboard se já autenticado
const PUBLIC_AUTH_ROUTES = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = Boolean(token && token.length > 0);
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  // Se não autenticado e acessando área protegida, direciona para landing page (/)
  if (isProtectedRoute && !isAuthenticated) {
    const landingUrl = new URL('/', request.url);
    return NextResponse.redirect(landingUrl);
  }

  // Se já autenticado e acessando landing page, login ou cadastro, direciona para /dashboard
  if (isPublicAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas de páginas,
     * ignorando arquivos estáticos, rotas internas do Next (_next) e rotas de api.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
