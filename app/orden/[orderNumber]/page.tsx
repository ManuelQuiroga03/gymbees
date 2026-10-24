import React from "react";
import Link from "next/link";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, Truck } from "lucide-react";

interface OrderPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    status?: string;
    payment_id?: string;
  }>;
}

export default async function OrderSuccessPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { status, payment_id } = await searchParams;

  let orders: any[] = [];
  let items: any[] = [];

  try {
    orders = await query(
      `SELECT * FROM orders WHERE order_number = $1`,
      [orderNumber]
    );

    if (orders.length > 0) {
      items = await query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [orders[0].id]
      );
    }
  } catch (err) {
    console.warn("Advertencia de DB en orden:", (err as any)?.message);
  }

  const isApproved = status === "approved" || (orders.length > 0 && orders[0].payment_status === "paid");
  const isPending = status === "pending";

  const order = orders.length > 0 ? orders[0] : {
    order_number: orderNumber,
    created_at: new Date().toISOString(),
    total: 799.00,
    shipping_address: {
      customer: { fullName: "Atleta Gymbees", email: "atleta@gymbees.mx" },
      shippingAddress: { street: "Dirección registrada", postalCode: "00000" }
    }
  };

  const address = order.shipping_address?.shippingAddress || {};
  const customer = order.shipping_address?.customer || {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-surface border border-border-subtle rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center sm:text-left">
        
        {/* Success Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-border-subtle pb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
            isApproved 
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-400"
              : isPending
              ? "bg-amber-950/80 border-amber-800 text-amber-400"
              : "bg-surface-elevated border-border-subtle text-primary"
          }`}>
            {isApproved ? (
              <CheckCircle2 className="w-9 h-9" />
            ) : isPending ? (
              <Clock className="w-9 h-9" />
            ) : (
              <CheckCircle2 className="w-9 h-9" />
            )}
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
              TICKET OFICIAL GYMBEES
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-foreground leading-tight">
              {isApproved
                ? "¡PAGO CONFIRMADO!"
                : isPending
                ? "PAGO EN PROCESO"
                : "¡ORDEN REGISTRADA!"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isApproved
                ? "Tu pago en Mercado Pago fue aprobado. Tu paquete entra en fase de preparación."
                : isPending
                ? "Tu pago en OXXO o transferencia está pendiente de acreditación."
                : "Hemos reservado tus prendas y preparado el paquete para despacho."}
            </p>
          </div>
        </div>

        {/* Order Details Badge */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-elevated rounded-2xl border border-border-subtle text-xs">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">NÚMERO DE ORDEN</span>
            <span className="font-mono font-black text-foreground text-sm">{order.order_number}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">FECHA</span>
            <span className="font-bold text-foreground">{new Date(order.created_at).toLocaleDateString("es-MX")}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">ESTADO</span>
            <span className={`font-bold uppercase ${isApproved ? "text-emerald-400" : isPending ? "text-amber-400" : "text-primary"}`}>
              {isApproved ? "APROBADO" : isPending ? "PENDIENTE" : "PROCESANDO"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">TOTAL</span>
            <span className="font-mono font-black text-primary text-sm">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Purchased Items List (si hay items en BD) */}
        {items.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-foreground">
              PRENDAS DE ENTRENAMIENTO
            </h3>
            <div className="divide-y divide-border-subtle bg-background rounded-2xl border border-border-subtle p-4">
              {items.map((item: any) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{item.product_name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {item.variant_info} • Cantidad: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Address and Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
              DIRECCIÓN DE ENTREGA
            </span>
            <p className="font-bold text-foreground">{customer.fullName || "Atleta"}</p>
            <p className="text-muted-foreground">{address.street || "Domicilio particular"}</p>
            <p className="text-muted-foreground">C.P. {address.postalCode || "00000"} • México</p>
          </div>

          <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">
              MÉTODO DE PAGO & ENVÍO
            </span>
            <p className="font-bold text-foreground">Mercado Pago (Checkout Pro)</p>
            <p className="text-muted-foreground">Despacho Express DHL / Estafeta (24-72h)</p>
            {payment_id && (
              <p className="text-[10px] font-mono text-primary">ID Transacción: {payment_id}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest py-3.5 rounded-xl text-center hover:bg-primary/90 transition-colors shadow-glow flex items-center justify-center gap-2"
          >
            <span>Volver al Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/mis-pedidos"
            className="bg-surface-elevated hover:bg-surface border border-border-subtle text-foreground font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl text-center transition-colors"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
