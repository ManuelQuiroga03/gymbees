import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const users = await query(
      `SELECT id, email, password_hash, full_name, role FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return res;
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
