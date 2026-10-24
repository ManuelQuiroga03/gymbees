import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gymbees_heavyweight_super_secure_jwt_secret_key_2026'
);

const COOKIE_NAME = 'gymbees_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedUserRoute = pathname.startsWith('/mis-pedidos') || pathname.startsWith('/checkout');

  if (!isAdminRoute && !isProtectedUserRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Si es ruta de administración, verificar rol 'admin'
    if (isAdminRoute && role !== 'admin') {
      // Redirigir a la home si no es administrador
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/mis-pedidos/:path*', '/checkout/:path*'],
};
