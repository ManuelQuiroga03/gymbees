import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

const RegisterSchema = z.object({
  email: z.string().email('Email no válido').toLowerCase().trim(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone } = validated.data;

    // Verificar si el usuario ya existe
    const existing = await query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertedUsers = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName, phone || null]
    );

    const newUser = insertedUsers[0];

    // Sincronizar con tabla profiles
    await query(
      `INSERT INTO profiles (id, email, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'customer')
       ON CONFLICT (id) DO NOTHING`,
      [newUser.id, newUser.email, newUser.full_name, phone || null]
    );

    const token = await signToken({
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
    });

    const res = NextResponse.json({
      success: true,
      user: newUser,
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
