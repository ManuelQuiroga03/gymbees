"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, Tag, Check, AlertCircle, ArrowLeft, ArrowRight, Lock } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, freeShippingThreshold, clearCart } = useCart();

  // Datos de envío
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [colony, setColony] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Cupón de descuento
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Validar cupón
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "Código inválido");
      }

      setAppliedDiscount({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedDiscount(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountVal = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const netSubtotal = Math.max(0, subtotal - discountVal);
  const shippingCost = netSubtotal >= freeShippingThreshold ? 0 : 150;
  const total = netSubtotal + shippingCost;

  // Confirmar compra
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        customer: { email, fullName, phone },
        shippingAddress: { street, colony, postalCode, city, state },
        discountCode: appliedDiscount?.code || null,
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      // Limpiar carrito
      clearCart();

      // Si Mercado Pago generó la URL de Checkout Pro, redirigir al portal de pago
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Redirigir al ticket de éxito
        router.push(`/orden/${data.orderNumber}`);
      }
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h1 className="font-display text-4xl uppercase text-foreground">TU BOLSA ESTÁ VACÍA</h1>
        <p className="text-xs text-muted-foreground">Agrega alguna prenda antes de proceder al checkout.</p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl"
        >
          Explorar Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>CHECKOUT SEGURO SSL DE 256 BITS</span>
        </div>
      </div>

      {orderError && (
        <div className="mb-6 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Formulario de Envío (7 columnas) */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkoutForm" onSubmit={handleConfirmOrder} className="space-y-6">
            
            {/* Paso 1: Contacto */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-2xl uppercase tracking-wider text-foreground flex items-center gap-2">
                <span>1. DATOS DEL ATLETA</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="atleta@gymbees.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rodrigo Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Teléfono Móvil (WhatsApp de Guía) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="55 8765 4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>
            </div>

            {/* Paso 2: Dirección en México */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-2xl uppercase tracking-wider text-foreground flex items-center gap-2">
                <span>2. DIRECCIÓN DE ENTREGA (MÉXICO)</span>
              </h2>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Calle y Número Exterior / Interior *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. Insurgentes Sur 1450, Depto 402"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Colonia / Asentamiento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Del Valle"
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Código Postal (5 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="03100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Ciudad / Municipio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Benito Juárez"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ciudad de México"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Paso 3: Método de Pago */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-3">
              <h2 className="font-display text-2xl uppercase tracking-wider text-foreground">
                3. MÉTODO DE PAGO
              </h2>
              <div className="p-4 bg-background border border-primary/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    PAGO DIRECTO EN LÍNEA / KUESKI PAY
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Modo seguro listo para asociar con Stripe o Mercado Pago
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </form>
        </div>

        {/* Resumen de Compra & Cupones (5 columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-6 sticky top-24">
            <h3 className="font-display text-2xl uppercase tracking-wider text-foreground pb-4 border-b border-border-subtle">
              RESUMEN DE LA ORDEN ({items.length})
            </h3>

            {/* Lista de Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Talla {item.size} • Cant: {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Formulario de Cupón de Descuento */}
            <div className="pt-4 border-t border-border-subtle">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  ¿Tienes un código de descuento o de atleta?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. DROP10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3.5 text-xs font-mono font-bold uppercase text-foreground outline-none"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="bg-surface-elevated hover:bg-border-subtle border border-border-subtle text-foreground text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    {validatingCoupon ? "..." : "Aplicar"}
                  </button>
                </div>
              </form>

              {couponError && (
                <p className="text-[11px] text-rose-400 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedDiscount && (
                <div className="mt-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>CUPÓN {appliedDiscount.code} APLICADO</span>
                  </div>
                  <span className="font-mono font-black">
                    -{formatPrice(appliedDiscount.discountAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="pt-4 border-t border-border-subtle space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Descuento</span>
                  <span>-{formatPrice(appliedDiscount.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Envío express México</span>
                <span className="text-foreground font-semibold">
                  {shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-foreground pt-3 border-t border-border-subtle">
                <span>TOTAL A PAGAR</span>
                <span className="text-primary text-xl font-mono">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              form="checkoutForm"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? "CONECTANDO CON MERCADO PAGO..." : `PAGAR CON MERCADO PAGO • ${formatPrice(total)}`}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex flex-col items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                💳 TARJETAS • SALDO MERCADO PAGO • OXXO PAY
              </span>
              <p className="text-[10px] text-center text-muted-foreground">
                📦 Despacho asegurado en 24-48h con DHL / Estafeta
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
