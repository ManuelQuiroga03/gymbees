import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getMercadoPagoPayment } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const idFromQuery = url.searchParams.get('data.id') || url.searchParams.get('id');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Si el webhook envía solo query params
    }

    const type = body?.type || topic;
    const paymentId = body?.data?.id || idFromQuery;

    console.log(`[Mercado Pago Webhook] Evento recibido: Tipo=${type}, ID=${paymentId}`);

    if (type === 'payment' && paymentId) {
      // 1. Consultar estado canónico del pago en la API de Mercado Pago
      const payment = await getMercadoPagoPayment(paymentId);

      const orderNumber = payment.external_reference;
      const paymentStatus = payment.status; // 'approved' | 'in_process' | 'rejected' | 'cancelled' | 'pending'
      const paymentMethod = payment.payment_method_id; // 'oxxo', 'master', 'visa', etc.

      console.log(`[Mercado Pago] Pago ${paymentId} para Orden ${orderNumber}: Estado = ${paymentStatus}`);

      if (orderNumber) {
        let dbStatus = 'pending';
        let dbPaymentStatus = 'unpaid';

        if (paymentStatus === 'approved') {
          dbStatus = 'processing';
          dbPaymentStatus = 'paid';
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          dbStatus = 'cancelled';
          dbPaymentStatus = 'failed';
        } else if (paymentStatus === 'in_process' || paymentStatus === 'pending') {
          dbStatus = 'pending';
          dbPaymentStatus = 'unpaid';
        }

        // 2. Actualizar estado de la orden en la base de datos
        try {
          await query(
            `UPDATE orders 
             SET status = $1, payment_status = $2, payment_intent_id = $3, updated_at = now()
             WHERE order_number = $4`,
            [dbStatus, dbPaymentStatus, String(paymentId), orderNumber]
          );

          // 3. Registrar evento de pago (Idempotencia)
          await query(
            `INSERT INTO payment_events (event_id, provider, payload)
             VALUES ($1, 'mercadopago', $2)
             ON CONFLICT (event_id) DO NOTHING`,
            [String(paymentId), JSON.stringify(payment)]
          );
        } catch (dbErr) {
          console.warn('[Mercado Pago Webhook] Advertencia DB:', (dbErr as any)?.message);
        }
      }
    }

    // Mercado Pago requiere status 200 para confirmar recepción del webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Mercado Pago Webhook Error]:', error);
    // Devolvemos 200 para evitar que Mercado Pago reintente en bucle infinito si es un payload malformado
    return NextResponse.json({ error: 'Webhook procesado con observaciones' }, { status: 200 });
  }
}
