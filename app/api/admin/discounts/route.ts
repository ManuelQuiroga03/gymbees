import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const discounts = await query(`
    SELECT * FROM discount_codes ORDER BY created_at DESC
  `);

  return NextResponse.json({ discounts });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { code, discountType, discountValue, minOrderAmount, maxUses } = await req.json();

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, '');

    const rows = await query(
      `INSERT INTO discount_codes (code, discount_type, discount_value, min_order_amount, max_uses, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [
        cleanCode,
        discountType,
        Number(discountValue),
        Number(minOrderAmount) || 0,
        maxUses ? Number(maxUses) : null,
      ]
    );

    return NextResponse.json({ success: true, discount: rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este código de descuento ya existe' }, { status: 409 });
    }
    console.error('Error al crear descuento:', error);
    return NextResponse.json({ error: 'Error al crear descuento' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id, isActive } = await req.json();

    await query(
      `UPDATE discount_codes SET is_active = $1 WHERE id = $2`,
      [isActive, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar estado de cupón:', error);
    return NextResponse.json({ error: 'Error al actualizar cupón' }, { status: 500 });
  }
}
