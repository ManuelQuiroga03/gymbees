"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/commerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Check, AlertCircle, Image as ImageIcon, ArrowRight, Sparkles } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  
  // Seleccionar por defecto la primera variante con stock
  const availableVariants = product.variants.filter((v) => v.isAvailable);
  const [selectedVariant, setSelectedVariant] = useState(
    availableVariants[0] || product.variants[0]
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCart = () => {
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

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      openCart();
    }, 400);
  };

  const hasImages = product.images && product.images.length > 0;
  const currentPrice = selectedVariant?.price || product.basePrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const discountPercent = compareAtPrice && compareAtPrice > currentPrice
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
    : null;

  return (
    <div className="group bg-surface/90 border border-border-subtle rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-border-strong hover:shadow-2xl relative">
      
      {/* Contador de Imágenes Flotante */}
      {hasImages && product.images.length > 1 && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="bg-black/70 backdrop-blur-md text-neutral-300 text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
            <ImageIcon className="w-3 h-3 text-primary/80" />
            <span>+{product.images.length - 1}</span>
          </span>
        </div>
      )}

      {/* Showcase Visual: Aspect Ratio Estricto 4:5 para Todas las Tarjetas */}
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-[4/5] w-full bg-surface-elevated border-b border-border-subtle overflow-hidden flex items-center justify-center cursor-pointer block"
      >
        {hasImages ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-36 h-48 rounded-xl bg-background border border-border-strong/60 flex flex-col items-center justify-center p-4 text-center shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
            <Sparkles className="w-8 h-8 text-primary mb-2 opacity-80" />
            <span className="font-display text-sm tracking-wider text-foreground leading-tight">
              {product.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground mt-2 bg-surface px-2 py-0.5 rounded border border-border-subtle">
              {product.materialGsm}
            </span>
          </div>
        )}
      </Link>

      {/* Cuerpo de la Tarjeta con Altura Nivelada */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Cabecera: Categoría, Título y Precio */}
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary/80 block">
            {product.categoryName || "HEAVYWEIGHT SERIES"}
          </span>

          <Link href={`/producto/${product.slug}`} className="block group/title mt-1.5">
            <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-foreground leading-tight line-clamp-2 min-h-[3rem] group-hover/title:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Precio Limpio y Contundente */}
          <div className="flex items-baseline gap-2.5 mt-2.5">
            <span className="text-xl font-mono font-black text-foreground">
              {formatPrice(currentPrice)}
            </span>
            {compareAtPrice && compareAtPrice > currentPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through font-mono">
                  {formatPrice(compareAtPrice)}
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Selector de Tallas Minimalista */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Talla: <strong className="text-foreground">{selectedVariant?.size}</strong></span>
            {selectedVariant?.isLowStock && (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {selectedVariant.stockQuantity} disponibles
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isAvailable = v.isAvailable;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  disabled={!isAvailable}
                  className={`h-8 min-w-[2.25rem] px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-foreground text-background shadow-md font-black scale-102"
                      : isAvailable
                      ? "bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground border border-border-subtle"
                      : "bg-surface/30 text-muted-foreground/30 line-through cursor-not-allowed border border-transparent"
                  }`}
                  title={isAvailable ? `Talla ${v.size} (${v.stockQuantity} disponibles)` : `Talla ${v.size} Agotada`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Acciones: Quick Add + Link al PDP */}
        <div className="space-y-2 pt-2 border-t border-border-subtle/60">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !selectedVariant.isAvailable}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
              !selectedVariant || !selectedVariant.isAvailable
                ? "bg-surface-elevated text-muted-foreground border border-border-subtle cursor-not-allowed opacity-60"
                : addedAnimation
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground active:scale-98 shadow-sm"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>AGREGADO A TU BOLSA</span>
              </>
            ) : !selectedVariant || !selectedVariant.isAvailable ? (
              <span>TALLA AGOTADA</span>
            ) : (
              <span>+ AÑADIR A LA BOLSA ({selectedVariant.size})</span>
            )}
          </button>

          <Link
            href={`/producto/${product.slug}`}
            className="w-full py-1 text-center text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider flex items-center justify-center gap-1 group/link transition-colors"
          >
            <span>Ver detalles y medidas</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1 text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
