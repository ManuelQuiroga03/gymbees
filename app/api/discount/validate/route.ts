import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Ingresa un código' }, { status: 400 });
    }

    const numericSubtotal = Number(subtotal) || 0;

    const rows = await query(
      `SELECT id, code, discount_type, discount_value, min_order_amount, max_uses, uses_count, expires_at, is_active
       FROM discount_codes
       WHERE LOWER(code) = LOWER($1) AND is_active = true`,
      [code.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'El cupón no existe o está inactivo' }, { status: 404 });
    }

    const discount = rows[0];

    // 1. Validar fecha de expiración
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Este cupón ha expirado' }, { status: 400 });
    }

    // 2. Validar límite de usos
    if (discount.max_uses && discount.uses_count >= discount.max_uses) {
      return NextResponse.json({ valid: false, error: 'Este cupón ha alcanzado su límite de usos' }, { status: 400 });
    }

    // 3. Validar monto mínimo de compra
    const minAmount = Number(discount.min_order_amount) || 0;
    if (numericSubtotal < minAmount) {
      return NextResponse.json(
        { valid: false, error: `Compra mínima de $${minAmount.toFixed(2)} MXN requerida para este cupón` },
        { status: 400 }
      );
    }

    // 4. Calcular deducción
    let discountAmount = 0;
    const value = Number(discount.discount_value);

    if (discount.discount_type === 'percentage') {
      discountAmount = (numericSubtotal * value) / 100;
    } else {
      discountAmount = Math.min(numericSubtotal, value);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: discount.code,
      discountType: discount.discount_type,
      discountValue: value,
      discountAmount,
      newSubtotal: Math.max(0, numericSubtotal - discountAmount),
    });
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return NextResponse.json({ valid: false, error: 'Error al validar el cupón' }, { status: 500 });
  }
}
