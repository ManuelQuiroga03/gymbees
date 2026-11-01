import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { variantId, stockQuantity, price } = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: 'variantId requerido' }, { status: 400 });
    }

    if (stockQuantity !== undefined) {
      await query(
        `UPDATE inventory SET stock_quantity = $1, updated_at = now() WHERE variant_id::text = $2::text`,
        [Math.max(0, Number(stockQuantity)), variantId]
      );
    }

    if (price !== undefined) {
      await query(
        `UPDATE product_variants SET price_override = $1 WHERE id::text = $2::text`,
        [Number(price), variantId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
