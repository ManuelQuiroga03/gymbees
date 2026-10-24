"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, CheckCircle2 } from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
    freeShippingThreshold,
    amountUntilFreeShipping,
    freeShippingProgress,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border-subtle flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-display text-2xl tracking-wider uppercase text-foreground">
                TU BOLSA ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gamified Free Shipping Bar */}
          <div className="bg-surface-elevated p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
              {amountUntilFreeShipping > 0 ? (
                <>
                  <Truck className="w-4 h-4 text-primary shrink-0 animate-bounce" />
                  <span className="text-foreground">
                    Estás a <strong className="text-primary">{formatPrice(amountUntilFreeShipping)}</strong> de obtener <strong className="underline">ENVÍO GRATIS</strong>
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    ¡Felicidades! Tienes ENVÍO GRATIS asegurado
                  </span>
                </>
              )}
            </div>

            <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-display text-xl tracking-wider text-foreground uppercase">
                    TU BOLSA ESTÁ VACÍA
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Explora nuestros drops pesados y siluetas oversized de 240+ GSM.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-4 bg-primary text-primary-foreground font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  VER CATÁLOGO
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-surface-elevated border border-border-subtle rounded-xl p-4 flex gap-4 transition-all hover:border-border-strong"
                >
                  {/* Image or Graphic Fallback */}
                  <div className="w-20 h-24 bg-background border border-border-subtle rounded-lg flex flex-col items-center justify-center p-2 text-center shrink-0">
                    <span className="font-display text-xs tracking-wider text-primary font-bold">
                      GYMBEES
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono mt-1">
                      {item.size}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-xs uppercase text-foreground leading-tight">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground hover:text-rose-400 p-1 transition-colors"
                          aria-label="Eliminar prenda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded bg-background border border-border-subtle text-foreground">
                          TALLA {item.size}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.colorName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle/50">
                      <div className="flex items-center border border-border-subtle rounded-md bg-background">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Restar unidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-foreground font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                          aria-label="Sumar unidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-surface border-t border-border-subtle space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Envío estimado</span>
                  <span className="text-foreground font-semibold">
                    {subtotal >= freeShippingThreshold ? "GRATIS" : formatPrice(150)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border-subtle">
                  <span>Total</span>
                  <span className="text-primary text-lg">
                    {formatPrice(subtotal + (subtotal >= freeShippingThreshold ? 0 : 150))}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground text-center bg-surface-elevated py-2 px-3 rounded-lg border border-border-subtle">
                💳 O 4 quincenas de <strong className="text-foreground">{formatPrice((subtotal + (subtotal >= freeShippingThreshold ? 0 : 150)) / 4)}</strong> con Kueski Pay
              </div>

              <button
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="w-full bg-primary hover:bg-white text-primary-foreground font-black py-4 rounded-lg text-xs uppercase tracking-widest transition-all shadow-glow flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                PROCEDER AL CHECKOUT SEGURO
              </button>

              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                🔒 Transacción encriptada SSL de 256 bits
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
