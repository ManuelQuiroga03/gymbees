"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/commerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Sparkles, Check, AlertCircle, Image as ImageIcon, ArrowRight } from "lucide-react";

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

  const kueskiInstallment = selectedVariant ? selectedVariant.price / 4 : product.basePrice / 4;
  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="group bg-surface border border-border-subtle rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-border-strong hover:shadow-2xl relative">
      
      {/* Badges */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
        {selectedVariant?.isLowStock ? (
          <span className="bg-amber-950/80 border border-amber-600/40 text-amber-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1 backdrop-blur-md">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            ¡ÚLTIMAS {selectedVariant.stockQuantity} PIEZAS!
          </span>
        ) : (
          <span className="bg-surface/85 border border-border-subtle text-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider backdrop-blur-md">
            DROP OFICIAL
          </span>
        )}
      </div>

      {/* Visual Showcase: Enlace a la Ficha de Producto (PDP) */}
      <Link
        href={`/producto/${product.slug}`}
        className="relative h-88 bg-surface-elevated border-b border-border-subtle flex items-center justify-center overflow-hidden cursor-pointer"
      >
        {hasImages ? (
          <div className="w-full h-full relative overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {product.images.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-border-subtle flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                +{product.images.length - 1}
              </span>
            )}
          </div>
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

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {product.categoryName || "HEAVYWEIGHT SERIES"}
          </span>

          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-display text-2xl tracking-wide uppercase text-foreground leading-tight mt-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-xl font-black text-foreground">
              {formatPrice(selectedVariant?.price || product.basePrice)}
            </span>
            {selectedVariant?.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                {formatPrice(selectedVariant.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground mt-1">
            4 pagos de <strong className="text-foreground">{formatPrice(kueskiInstallment)}</strong> con Kueski Pay
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <span>SELECCIONAR TALLA:</span>
            {selectedVariant && (
              <span className="text-primary font-mono">
                {selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} EN STOCK` : "AGOTADO"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isAvailable = v.isAvailable;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  disabled={!isAvailable}
                  className={`py-2 text-xs font-black rounded-lg border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : isAvailable
                      ? "bg-background hover:bg-surface-elevated text-foreground border-border-subtle"
                      : "bg-background/40 text-muted-foreground/40 border-border-subtle/40 line-through cursor-not-allowed"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Add CTA & Link to PDP */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !selectedVariant.isAvailable}
            className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
              !selectedVariant || !selectedVariant.isAvailable
                ? "bg-surface-elevated text-muted-foreground border border-border-subtle cursor-not-allowed"
                : addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground active:scale-98"
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
              <span>AGREGAR RÁPIDO ({selectedVariant.size})</span>
            )}
          </button>

          <Link
            href={`/producto/${product.slug}`}
            className="w-full py-2 text-center text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1 group/link transition-colors"
          >
            <span>Ver detalles & medidas</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
