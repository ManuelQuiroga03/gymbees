import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createMercadoPagoPreference } from '@/lib/mercadopago';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let orders;
    if (user.role === 'admin') {
      orders = await query(`SELECT * FROM orders ORDER BY created_at DESC`);
    } else {
      orders = await query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id]
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json({ error: 'Error al consultar órdenes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let client;
  try {
    const body = await req.json();
    const { items, customer, shippingAddress, discountCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    if (!customer?.email || !shippingAddress?.postalCode) {
      return NextResponse.json({ error: 'Datos de envío y cliente incompletos' }, { status: 400 });
    }

    const sessionUser = await getCurrentUser();
    const userId = sessionUser ? sessionUser.id : null;

    let calculatedSubtotal = 0;
    const orderItemsToInsert: any[] = [];
    const mpItems: any[] = [];

    let hasDb = true;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
    } catch (dbErr) {
      hasDb = false;
      console.warn('Postgres no disponible, procesando orden en modo desacoplado:', (dbErr as any)?.message);
    }

    if (hasDb && client) {
      // 1. Validar y descontar stock atómico en PostgreSQL
      for (const item of items) {
        const { variantId, quantity } = item;
        const qty = Number(quantity) || 1;

        const variantRes = await client.query(
          `SELECT v.id, v.sku, v.size, v.color_name, v.price_override, p.name, p.base_price,
                  i.stock_quantity, i.reserved_quantity
           FROM product_variants v
           JOIN products p ON v.product_id = p.id
           JOIN inventory i ON v.id = i.variant_id
           WHERE v.id = $1 AND v.is_active = true
           FOR UPDATE`,
          [variantId]
        );

        if (variantRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Prenda o variante no disponible' }, { status: 400 });
        }

        const variant = variantRes.rows[0];
        const available = variant.stock_quantity - variant.reserved_quantity;

        if (available < qty) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: `Lo sentimos, la talla ${variant.size} de "${variant.name}" solo tiene ${available} piezas disponibles.` },
            { status: 409 }
          );
        }

        const unitPrice = Number(variant.price_override || variant.base_price);
        const lineTotal = unitPrice * qty;
        calculatedSubtotal += lineTotal;

        orderItemsToInsert.push({
          variantId: variant.id,
          productName: variant.name,
          variantInfo: `${variant.color_name} / Talla ${variant.size}`,
          unitPrice,
          quantity: qty,
          totalPrice: lineTotal,
        });

        mpItems.push({
          title: `${variant.name} (${variant.size})`,
          unit_price: unitPrice,
          quantity: qty,
        });

        // Descontar inventario inmediatamente
        await client.query(
          `UPDATE inventory 
           SET stock_quantity = stock_quantity - $1, updated_at = now() 
           WHERE variant_id = $2`,
          [qty, variantId]
        );
      }

      // 2. Validar Cupón de Descuento
      let discountAmount = 0;
      let appliedCode: string | null = null;

      if (discountCode) {
        const discRes = await client.query(
          `SELECT id, code, discount_type, discount_value, min_order_amount
           FROM discount_codes
           WHERE LOWER(code) = LOWER($1) AND is_active = true
           FOR UPDATE`,
          [discountCode.trim()]
        );

        if (discRes.rows.length > 0) {
          const disc = discRes.rows[0];
          const minReq = Number(disc.min_order_amount) || 0;

          if (calculatedSubtotal >= minReq) {
            const val = Number(disc.discount_value);
            if (disc.discount_type === 'percentage') {
              discountAmount = Math.round(((calculatedSubtotal * val) / 100) * 100) / 100;
            } else {
              discountAmount = Math.min(calculatedSubtotal, val);
            }
            appliedCode = disc.code;

            await client.query(
              `UPDATE discount_codes SET uses_count = uses_count + 1 WHERE id = $1`,
              [disc.id]
            );
          }
        }
      }

      // 3. Calcular Envío y Total
      const netSubtotal = Math.max(0, calculatedSubtotal - discountAmount);
      const shippingCost = netSubtotal >= 1299 ? 0 : 150;
      const finalTotal = netSubtotal + shippingCost;
      const orderNumber = `GB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Crear preferencia de pago en Mercado Pago
      let mpPreference = null;
      try {
        mpPreference = await createMercadoPagoPreference({
          orderNumber,
          items: mpItems,
          customer,
          shippingAddress,
          shippingCost,
          discountAmount,
        });
      } catch (mpError) {
        console.error('Error al generar preferencia en Mercado Pago:', mpError);
      }

      // 5. Guardar Orden en BD (con status pendiente de pago)
      const orderRes = await client.query(
        `INSERT INTO orders (
          order_number, user_id, customer_email, status, payment_status,
          payment_provider, subtotal, shipping_cost, discount, discount_code, total, shipping_address
        ) VALUES ($1, $2, $3, 'pending', 'unpaid', 'mercadopago', $4, $5, $6, $7, $8, $9)
        RETURNING id, order_number, total, created_at`,
        [
          orderNumber,
          userId,
          customer.email,
          calculatedSubtotal,
          shippingCost,
          discountAmount,
          appliedCode,
          finalTotal,
          JSON.stringify({ customer, shippingAddress }),
        ]
      );

      const createdOrder = orderRes.rows[0];

      // 6. Insertar items
      for (const item of orderItemsToInsert) {
        await client.query(
          `INSERT INTO order_items (order_id, variant_id, product_name, variant_info, unit_price, quantity, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            createdOrder.id,
            item.variantId,
            item.productName,
            item.variantInfo,
            item.unitPrice,
            item.quantity,
            item.totalPrice,
          ]
        );
      }

      await client.query('COMMIT');

      const paymentUrl = mpPreference?.initPoint || mpPreference?.sandboxInitPoint || null;

      return NextResponse.json({
        success: true,
        orderNumber: createdOrder.order_number,
        paymentUrl,
        total: finalTotal,
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shippingCost,
      });
    } else {
      // Modo Fallback si Postgres no está activo en local
      items.forEach((item: any) => {
        const price = Number(item.price) || 649;
        const qty = Number(item.quantity) || 1;
        calculatedSubtotal += price * qty;
        mpItems.push({
          title: item.name || 'Gymbees Heavywear',
          unit_price: price,
          quantity: qty,
        });
      });

      const shippingCost = calculatedSubtotal >= 1299 ? 0 : 150;
      const finalTotal = calculatedSubtotal + shippingCost;
      const orderNumber = `GB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const mpPreference = await createMercadoPagoPreference({
        orderNumber,
        items: mpItems,
        customer,
        shippingAddress,
        shippingCost,
      });

      return NextResponse.json({
        success: true,
        orderNumber,
        paymentUrl: mpPreference?.initPoint || mpPreference?.sandboxInitPoint,
        total: finalTotal,
        subtotal: calculatedSubtotal,
        shippingCost,
      });
    }
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Error al procesar orden:', error);
    return NextResponse.json({ error: 'Error al procesar la compra con Mercado Pago' }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch {}
    }
  }
}
