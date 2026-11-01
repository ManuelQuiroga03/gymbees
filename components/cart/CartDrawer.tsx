"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Tag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

// Accesorio insignia sugerido para Upsell D2C
const UPSELL_ACCESSORY = {
  variantId: "b4444444-4444-4444-4444-444444444401",
  productId: "a4444444-4444-4444-4444-444444444444",
  name: "Heavy Duty Figure 8 Straps",
  slug: "heavy-duty-figure-8-straps",
  size: "OS" as const,
  colorName: "Negro / Amarillo Abeja",
  price: 299.0,
  compareAtPrice: 350.0,
  image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
  maxStock: 40,
};

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
    freeShippingThreshold,
    amountUntilFreeShipping,
    freeShippingProgress,
    appliedDiscount,
    discountAmount,
    applyDiscount,
    removeDiscount,
  } = useCart();

  // Estado del cupón de descuento
  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Cerrar con Escape y bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, closeCart]);

  // Manejar aplicación de cupón
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    const res = await applyDiscount(couponInput);
    setCouponLoading(false);

    if (res.success) {
      setCouponInput("");
      setShowCouponInput(false);
    } else {
      setCouponError(res.error || "Cupón inválido");
    }
  };

  // Agregar accesorio de impulso
  const handleAddUpsell = () => {
    addItem({
      variantId: UPSELL_ACCESSORY.variantId,
      productId: UPSELL_ACCESSORY.productId,
      name: UPSELL_ACCESSORY.name,
      slug: UPSELL_ACCESSORY.slug,
      size: UPSELL_ACCESSORY.size,
      colorName: UPSELL_ACCESSORY.colorName,
      price: UPSELL_ACCESSORY.price,
      image: UPSELL_ACCESSORY.image,
      quantity: 1,
      maxStock: UPSELL_ACCESSORY.maxStock,
    });
  };

  // Verificar si el usuario ya tiene el accesorio en la bolsa
  const hasUpsellInCart = items.some((i) => i.variantId === UPSELL_ACCESSORY.variantId);

  // Cálculos finales de envío y total
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 150;
  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const finalTotal = netSubtotal + shippingCost;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop oscuro con desenfoque */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md bg-surface border-l border-border-subtle flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 1. Header */}
          <div className="p-5 sm:p-6 border-b border-border-subtle flex items-center justify-between bg-surface/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2
                  id="slide-over-title"
                  className="font-display text-xl sm:text-2xl tracking-wider uppercase text-foreground leading-none"
                >
                  TU BOLSA ({totalItems})
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  GYMBEES HEAVY CLUB
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-subtle"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Barra Gamificada de Envío Gratis */}
          <div className="bg-surface-elevated/70 p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-2 text-xs">
              {amountUntilFreeShipping > 0 ? (
                <>
                  <Truck className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                  <span className="text-foreground text-[11px] sm:text-xs">
                    Estás a{" "}
                    <strong className="text-primary font-bold">
                      {formatPrice(amountUntilFreeShipping)}
                    </strong>{" "}
                    de obtener <strong className="underline underline-offset-2">ENVÍO GRATIS</strong>
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1">
                    ¡ENVÍO GRATIS DESBLOQUEADO! <Sparkles className="w-3.5 h-3.5 inline" />
                  </span>
                </>
              )}
            </div>

            <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border-subtle/80">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "bg-primary shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* 3. Lista de Prendas */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-9 h-9 text-muted-foreground/60" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <p className="font-display text-xl tracking-wider text-foreground uppercase">
                    TU BOLSA ESTÁ VACÍA
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Nuestros drops de 240+ GSM y piezas de compresión se producen en lotes limitados.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest px-7 py-3.5 rounded-xl hover:bg-white transition-all shadow-glow active:scale-95"
                >
                  EXPLORAR CATÁLOGO ACTIVO
                </button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="bg-surface-elevated border border-border-subtle rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 transition-all hover:border-border-strong group"
                  >
                    {/* Fotografía de la prenda */}
                    <div className="w-20 h-24 sm:w-22 sm:h-28 bg-background border border-border-subtle rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                          <span className="font-display text-[10px] tracking-wider text-primary font-bold">
                            GYMBEES
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            {item.size}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información y Controles */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-xs uppercase text-foreground leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-muted-foreground hover:text-rose-400 p-1 transition-colors rounded hover:bg-rose-500/10 shrink-0"
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded bg-background border border-border-subtle text-foreground font-mono">
                            TALLA {item.size}
                          </span>
                          {item.colorName && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {item.colorName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle/50">
                        {/* Selector de cantidad */}
                        <div className="flex items-center border border-border-subtle rounded-lg bg-background">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors rounded-l-md"
                            aria-label="Restar unidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground font-mono select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors rounded-r-md disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Sumar unidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Precio por renglón */}
                        <span className="font-extrabold text-sm text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 4. Upsell D2C de Impulso ("Completa tu Armadura") */}
                {!hasUpsellInCart && (
                  <div className="mt-6 p-3.5 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/5 to-transparent relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-16 rounded-lg bg-background border border-border-subtle overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={UPSELL_ACCESSORY.image}
                            alt={UPSELL_ACCESSORY.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                              RECOMENDADO
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground truncate mt-1">
                            {UPSELL_ACCESSORY.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-primary">
                              {formatPrice(UPSELL_ACCESSORY.price)}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(UPSELL_ACCESSORY.compareAtPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAddUpsell}
                        className="bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground font-black text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg border border-primary/30 transition-all shrink-0 active:scale-95"
                      >
                        + AÑADIR
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 5. Footer: Descuento, Totales y Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-surface border-t border-border-subtle space-y-4">
              
              {/* Sección Cupón de Descuento */}
              <div className="border-b border-border-subtle/60 pb-3">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {appliedDiscount.code}
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        (-{formatPrice(discountAmount)})
                      </span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-muted-foreground hover:text-rose-400 p-1 transition-colors"
                      title="Quitar cupón"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : showCouponInput ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CÓDIGO (EJ: DROP10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-background border border-border-subtle rounded-lg px-3 py-2 text-xs uppercase font-mono tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="bg-surface-elevated hover:bg-primary hover:text-primary-foreground text-foreground border border-border-subtle px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                    >
                      {couponLoading ? "..." : "APLICAR"}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowCouponInput(true)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>¿Tienes un cupón o código de drop?</span>
                  </button>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{couponError}</p>
                )}
              </div>

              {/* Desglose de Precios */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold font-mono">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Descuento ({appliedDiscount?.code})
                    </span>
                    <span className="font-semibold font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Envío nacional</span>
                  <span className="text-foreground font-semibold font-mono">
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold">GRATIS</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border-subtle">
                  <span>Total estimado</span>
                  <span className="text-primary text-lg font-mono">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Badge Kueski Pay */}
              <div className="text-[11px] text-muted-foreground text-center bg-surface-elevated py-2 px-3 rounded-lg border border-border-subtle">
                💳 O 4 quincenas de{" "}
                <strong className="text-foreground font-mono">{formatPrice(finalTotal / 4)}</strong> sin tarjeta con Kueski Pay
              </div>

              {/* Botón Principal a Checkout */}
              <button
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="w-full bg-primary hover:bg-white text-primary-foreground font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-glow flex items-center justify-center gap-2 active:scale-[0.98] group"
              >
                <span>PROCEDER AL CHECKOUT SEGURO</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Micro-Badges de Confianza D2C */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-subtle/50 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Pago Encriptado SSL</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Primer cambio gratis</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CartDrawer;
