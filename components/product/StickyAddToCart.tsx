"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/commerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

interface StickyAddToCartProps {
  product: Product;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

export function StickyAddToCart({ product, targetRef }: StickyAddToCartProps) {
  const { addItem, openCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Variante por defecto
  const availableVariants = product.variants.filter((v) => v.isAvailable);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0] || product.variants[0]
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Cuando el botón original sale de la pantalla hacia arriba (scrolled down), mostramos el sticky
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  if (!isVisible) return null;

  const handleAdd = () => {
    if (!selectedVariant || !selectedVariant.isAvailable) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size: selectedVariant.size,
      colorName: selectedVariant.colorName,
      price: selectedVariant.price,
      image: product.images?.[0],
      quantity: 1,
      maxStock: selectedVariant.stockQuantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 400);
  };

  const price = selectedVariant?.price || product.basePrice;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-lg border-t border-border-strong px-4 py-3 shadow-2xl animate-in slide-in-from-bottom duration-300 md:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Imagen & Título */}
        <div className="flex items-center gap-3 min-w-0">
          {product.images?.[0] && (
            <div className="w-12 h-12 rounded-lg bg-surface-elevated border border-border-subtle overflow-hidden shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-display text-sm uppercase tracking-wide text-foreground truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-primary font-mono">{formatPrice(price)}</span>
              <span className="text-muted-foreground">• Talla {selectedVariant?.size}</span>
            </div>
          </div>
        </div>

        {/* Botón Acción Rápida */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedVariant?.isAvailable}
          className={`h-11 px-5 rounded-xl font-bold uppercase text-xs tracking-wider shrink-0 flex items-center gap-1.5 transition-all ${
            !selectedVariant?.isAvailable
              ? "bg-surface-elevated text-muted-foreground cursor-not-allowed"
              : isAdded
              ? "bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground active:scale-95 shadow-md shadow-primary/20"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              <span>AGREGADO</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>AGREGAR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
