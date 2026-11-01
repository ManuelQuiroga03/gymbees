"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { 
  ShieldCheck, 
  Truck, 
  Tag, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  CreditCard,
  Building2,
  Wallet
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    freeShippingThreshold,
    clearCart,
    appliedDiscount: cartDiscount,
    discountAmount: cartDiscountAmount,
    applyDiscount: cartApplyDiscount,
    removeDiscount: cartRemoveDiscount,
  } = useCart();

  // Datos de envío
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [colony, setColony] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Errores de validación de campos
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    postalCode?: string;
    fullName?: string;
    street?: string;
  }>({});

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

  // Manejador del teléfono (solo dígitos, máximo 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numeric);
    if (numeric.length === 10) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  // Manejador del código postal (solo dígitos, máximo 5)
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 5);
    setPostalCode(numeric);
    if (numeric.length === 5) {
      setFieldErrors((prev) => ({ ...prev, postalCode: undefined }));
    }
  };

  // Validaciones al salir del input (onBlur)
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "El correo es obligatorio" }));
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: "Ingresa un correo electrónico válido (ej. atleta@gymbees.mx)" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePhone = () => {
    if (!phone) {
      setFieldErrors((prev) => ({ ...prev, phone: "El teléfono móvil es obligatorio" }));
      return false;
    }
    if (phone.length !== 10) {
      setFieldErrors((prev) => ({ ...prev, phone: "El número debe tener exactamente 10 dígitos (ej. 5512345678)" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    return true;
  };

  const validatePostalCode = () => {
    if (!postalCode || postalCode.length !== 5) {
      setFieldErrors((prev) => ({ ...prev, postalCode: "El código postal debe ser de 5 dígitos" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, postalCode: undefined }));
    return true;
  };

  // Sincronizar cupón del carrito con checkout
  useEffect(() => {
    if (cartDiscount) {
      setAppliedDiscount({
        code: cartDiscount.code,
        discountAmount: cartDiscountAmount,
        discountType: cartDiscount.discountType,
        discountValue: cartDiscount.discountValue,
      });
    } else {
      setAppliedDiscount(null);
    }
  }, [cartDiscount, cartDiscountAmount]);

  // Validar cupón
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    const res = await cartApplyDiscount(couponCode);
    setValidatingCoupon(false);

    if (res.success) {
      setCouponCode("");
    } else {
      setCouponError(res.error || "Código inválido");
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

    // Validar todos los campos críticos
    const isEmailOk = validateEmail();
    const isPhoneOk = validatePhone();
    const isZipOk = validatePostalCode();

    if (!isEmailOk || !isPhoneOk || !isZipOk) {
      setOrderError("Por favor corrige los datos marcados en rojo antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({ 
          variantId: i.variantId, 
          quantity: i.quantity,
          name: i.name,
          price: i.price,
        })),
        customer: { email: email.trim(), fullName: fullName.trim(), phone: phone.trim() },
        shippingAddress: { street: street.trim(), colony: colony.trim(), postalCode: postalCode.trim(), city: city.trim(), state: state.trim() },
        discountCode: appliedDiscount?.code || null,
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido con Mercado Pago");
      }

      // Si Mercado Pago generó el link de pago oficial, redirigir
      if (data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
      } else {
        // Redirigir al ticket de orden
        clearCart();
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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>CHECKOUT SEGURO SSL DE 256 BITS</span>
        </div>
      </div>

      {orderError && (
        <div className="mb-6 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) validateEmail();
                    }}
                    onBlur={validateEmail}
                    className={`w-full bg-background border rounded-xl py-3 px-4 text-xs text-foreground outline-none transition-colors ${
                      fieldErrors.email
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-border-subtle focus:border-primary"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Manuel Hernández"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Teléfono Móvil (WhatsApp de Guía) *
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {phone.length}/10 dígitos
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="5523539962"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={validatePhone}
                  maxLength={10}
                  className={`w-full bg-background border rounded-xl py-3 px-4 text-xs text-foreground outline-none font-mono transition-colors ${
                    fieldErrors.phone
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-border-subtle focus:border-primary"
                  }`}
                />
                {fieldErrors.phone ? (
                  <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Solo 10 dígitos numéricos sin espacios ni guiones para notificación de guía de envío.
                  </p>
                )}
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
                  placeholder="Josefa Ortiz de Domínguez SN"
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
                    placeholder="Cuautilulco"
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Código Postal (5 dígitos) *
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {postalCode.length}/5
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="73310"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                    onBlur={validatePostalCode}
                    className={`w-full bg-background border rounded-xl py-3 px-4 text-xs text-foreground outline-none font-mono transition-colors ${
                      fieldErrors.postalCode
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-border-subtle focus:border-primary"
                    }`}
                  />
                  {fieldErrors.postalCode && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.postalCode}</span>
                    </p>
                  )}
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
                    placeholder="Zacatlán"
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
                    placeholder="Puebla"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Paso 3: Método de Pago Explicado */}
            <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl uppercase tracking-wider text-foreground">
                  3. MÉTODO DE PAGO
                </h2>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded">
                  CHECKOUT PRO ACTIVO
                </span>
              </div>

              {/* Opción Seleccionada: Mercado Pago */}
              <div className="p-5 bg-background border-2 border-primary rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-display text-lg tracking-wide uppercase text-foreground block">
                        MERCADO PAGO (MÉXICO)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Pasarela oficial con respaldo y protección al comprador
                      </span>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>

                <div className="border-t border-border-subtle pt-3 text-xs text-muted-foreground space-y-2">
                  <p>
                    Al presionar <strong>PAGAR CON MERCADO PAGO</strong>, se abrirá la pasarela segura oficial donde podrás elegir tu forma de pago preferida:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-semibold text-foreground">
                    <div className="flex items-center gap-1.5 p-2 bg-surface rounded-lg border border-border-subtle">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      <span>Tarjetas Débito / Crédito</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-surface rounded-lg border border-border-subtle">
                      <Wallet className="w-3.5 h-3.5 text-primary" />
                      <span>Saldo Mercado Pago</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-surface rounded-lg border border-border-subtle">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>Efectivo en OXXO / SPEI</span>
                    </div>
                  </div>
                </div>
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
                  <span className="font-mono font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Cupón */}
            <div className="pt-4 border-t border-border-subtle">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                ¿Tienes un código de descuento o de atleta?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EJ. DROP10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-background border border-border-subtle focus:border-primary rounded-xl px-3 py-2 text-xs font-mono text-foreground uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-surface hover:bg-surface-elevated border border-border-subtle text-foreground text-xs font-bold uppercase px-4 py-2 rounded-xl transition-colors disabled:opacity-40"
                >
                  {validatingCoupon ? "..." : "Aplicar"}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-rose-400 mt-1.5 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
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
