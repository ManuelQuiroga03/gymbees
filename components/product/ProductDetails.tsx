"use client";

import React, { useState } from "react";
import { Product, ProductVariant, ClothingSize } from "@/types/commerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { SizeGuideModal } from "./SizeGuideModal";
import { 
  ShoppingBag, 
  Ruler, 
  AlertCircle, 
  Check, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown, 
  Sparkles,
  CreditCard
} from "lucide-react";

interface ProductDetailsProps {
  product: Product;
  onButtonRef?: (el: HTMLButtonElement | null) => void;
}

export function ProductDetails({ product, onButtonRef }: ProductDetailsProps) {
  const { addItem, openCart } = useCart();
  
  // Variantes con stock inicial
  const availableVariants = product.variants.filter((v) => v.isAvailable);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0] || product.variants[0]
  );

  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Acordeones colapsables
  const [openAccordion, setOpenAccordion] = useState<string | null>("fabric");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Cálculo Kueski Pay (4 cuotas quincenales)
  const price = selectedVariant?.price || product.basePrice;
  const kueskiQuarter = (price / 4).toFixed(2);
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const discountPercent = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  // Manejo de cambio de talla
  const handleSizeSelect = (size: ClothingSize) => {
    // Buscar la variante que coincida con esa talla (y el mismo color si aplica)
    const match = product.variants.find(
      (v) => v.size === size && (selectedVariant ? v.colorName === selectedVariant.colorName : true)
    ) || product.variants.find((v) => v.size === size);

    if (match) {
      setSelectedVariant(match);
      setQuantity(1);
    }
  };

  // Manejo de Agregar al Carrito
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
      quantity,
      maxStock: selectedVariant.stockQuantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 400);
  };

  const isOutOfStock = !selectedVariant || !selectedVariant.isAvailable || selectedVariant.stockQuantity <= 0;
  const isLowStock = selectedVariant && selectedVariant.isLowStock;

  // Tallas únicas existentes en el producto
  const allSizes: ClothingSize[] = ["S", "M", "L", "XL", "2XL"];
  const existingSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Categoría y Título */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {product.categoryName || "HEAVYWEIGHT SERIES"}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">
            {product.fitType.toUpperCase()} FIT
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-foreground leading-tight">
          {product.name}
        </h1>

        {/* Reseñas & Social Proof */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <div className="flex text-amber-400">
            {"★★★★★"}
          </div>
          <span className="font-bold text-foreground">4.9</span>
          <span className="text-muted-foreground">(48 reseñas verificadas)</span>
        </div>
      </div>

      {/* 2. Precio y BNPL (Kueski Pay) */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-foreground">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <>
              <span className="text-lg line-through text-muted-foreground font-semibold">
                {formatPrice(compareAtPrice)}
              </span>
              <span className="text-xs font-bold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                -{discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Micro-banner Kueski */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <CreditCard className="w-4 h-4 text-primary shrink-0" />
          <span>
            ó 4 quincenas de <strong className="text-foreground">${kueskiQuarter} MXN</strong> con Kueski Pay sin tarjeta de crédito.
          </span>
        </div>
      </div>

      {/* 3. Selector de Talla con Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <span>SELECCIONA TU TALLA:</span>
            {selectedVariant && (
              <span className="text-primary font-mono font-black">
                {selectedVariant.size}
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 transition-colors"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Guía de Medidas (CM)</span>
          </button>
        </div>

        {/* Grid de Pills de Tallas */}
        <div className="grid grid-cols-5 gap-2.5">
          {existingSizes.map((size) => {
            const variantForSize = product.variants.find((v) => v.size === size);
            const isAvailable = variantForSize ? variantForSize.isAvailable : false;
            const isSelected = selectedVariant?.size === size;

            return (
              <button
                key={size}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleSizeSelect(size)}
                className={`h-13 rounded-xl font-bold font-mono text-sm uppercase transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-2 border-primary shadow-md scale-102"
                    : isAvailable
                    ? "bg-surface hover:bg-surface-elevated text-foreground border border-border-subtle hover:border-border-strong"
                    : "bg-surface/40 text-muted-foreground/30 border border-border-subtle/40 line-through cursor-not-allowed"
                }`}
              >
                <span>{size}</span>
                {variantForSize?.isLowStock && (
                  <span className="text-[9px] font-sans font-bold text-amber-400 absolute bottom-1">
                    ÚLTIMAS
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Alerta de Stock Bajo (CRO Trigger) */}
        {isLowStock && (
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-600/30 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>¡Atención! Solo quedan {selectedVariant.stockQuantity} piezas disponibles en talla {selectedVariant.size}.</span>
          </div>
        )}
      </div>

      {/* 4. Selector de Cantidad y Botón Principal de Compra */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          {/* Contador de Cantidad */}
          <div className="flex items-center border border-border-subtle rounded-xl bg-surface px-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-12 flex items-center justify-center text-foreground font-bold hover:text-primary disabled:opacity-30"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
              disabled={quantity >= selectedVariant.stockQuantity || isOutOfStock}
              className="w-8 h-12 flex items-center justify-center text-foreground font-bold hover:text-primary disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Botón Principal CTA */}
          <button
            ref={onButtonRef}
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`flex-1 h-14 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? "bg-surface-elevated text-muted-foreground border border-border-subtle cursor-not-allowed"
                : isAdded
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-primary/25 active:scale-98"
            }`}
          >
            {isOutOfStock ? (
              <span>AGOTADO TEMPORALMENTE</span>
            ) : isAdded ? (
              <>
                <Check className="w-5 h-5 animate-bounce" />
                <span>¡AGREGADO A LA BOLSA!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>AGREGAR A LA BOLSA • {formatPrice(price * quantity)}</span>
              </>
            )}
          </button>
        </div>

        {/* Garantías Rápidas */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border-subtle">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span>Envío gratis en compras &gt;$1,299 MXN</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border-subtle">
            <RefreshCw className="w-4 h-4 text-primary shrink-0" />
            <span>1er cambio de talla sin costo</span>
          </div>
        </div>
      </div>

      {/* 5. Acordeones Técnicos */}
      <div className="border-t border-border-subtle pt-4 divide-y divide-border-subtle">
        {/* Acordeón 1: Composición y Tejido */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleAccordion("fabric")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              DETALLES TÉCNICOS & COMPOSICIÓN
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "fabric" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "fabric" && (
            <div className="pt-3 text-xs text-muted-foreground space-y-2 leading-relaxed animate-in fade-in duration-200">
              <p>{product.description}</p>
              <ul className="list-disc list-inside space-y-1 pt-1 font-mono text-[11px]">
                <li><strong>Gramaje:</strong> {product.materialGsm}</li>
                <li><strong>Corte:</strong> {product.fitType.toUpperCase()} con caída estructurada</li>
                <li><strong>Estampado:</strong> Serigrafía de alta densidad libre de cuarteaduras</li>
                <li><strong>Costuras:</strong> Refuerzo en hombros y cuello acanalado de alta resiliencia</li>
              </ul>
            </div>
          )}
        </div>

        {/* Acordeón 2: Envíos y Tiempos */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleAccordion("shipping")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              ENVÍOS & TIEMPOS DE ENTREGA
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "shipping" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "shipping" && (
            <div className="pt-3 text-xs text-muted-foreground space-y-2 leading-relaxed animate-in fade-in duration-200">
              <p>Despachamos todos los pedidos en días hábiles desde nuestro centro en México:</p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
                <li><strong>CDMX y Área Metropolitana:</strong> 24 a 48 horas hábiles.</li>
                <li><strong>Resto de la República:</strong> 2 a 4 días hábiles vía DHL Express o Estafeta.</li>
                <li>Recibirás un número de guía rastreable directamente por correo y WhatsApp.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Acordeón 3: Cambios y Devoluciones */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleAccordion("returns")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              GARANTÍA DE AJUSTE (CAMBIOS FÁCILES)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "returns" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "returns" && (
            <div className="pt-3 text-xs text-muted-foreground space-y-2 leading-relaxed animate-in fade-in duration-200">
              <p>
                Sabemos lo importante que es sentirte seguro con el ajuste en el gimnasio. Si la talla no fue la adecuada, tienes <strong>30 días naturales</strong> a partir de la entrega para solicitar un cambio de talla sin costo adicional de envío en tu primer trámite.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Guía de Medidas */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        fitType={product.fitType}
      />
    </div>
  );
}
