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
  Sparkles
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

  // Acordeones colapsables (por defecto cerrados para mantener la pantalla 100% Above-the-Fold)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const price = selectedVariant?.price || product.basePrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const discountPercent = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  // Manejo de cambio de talla
  const handleSizeSelect = (size: ClothingSize) => {
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
  const existingSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Categoría y Título (Escalado -12%) */}
      <div className="space-y-1.5 border-b border-border-subtle/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
            {product.categoryName || "HEAVYWEIGHT SERIES"}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {product.fitType.toUpperCase()} FIT
          </span>
          {product.materialGsm && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {product.materialGsm}
              </span>
            </>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-[2rem] uppercase tracking-wider text-foreground leading-tight">
          {product.name}
        </h1>

        {/* Reseñas & Social Proof */}
        <div className="flex items-center gap-2 pt-0.5 text-xs">
          <div className="flex text-amber-400 text-xs">
            {"★★★★★"}
          </div>
          <span className="font-mono font-bold text-foreground text-xs">4.9</span>
          <span className="text-muted-foreground font-mono text-[10px]">(48 reseñas verificadas)</span>
        </div>
      </div>

      {/* 2. Precio Limpio de Alto Impacto (Sin Kueski, Compacto) */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl sm:text-3xl font-mono font-black text-foreground tracking-tight">
          {formatPrice(price)}
        </span>
        {compareAtPrice && compareAtPrice > price && (
          <>
            <span className="text-sm font-mono line-through text-muted-foreground font-semibold">
              {formatPrice(compareAtPrice)}
            </span>
            <span className="text-[10px] font-mono font-black uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded-md">
              -{discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {/* 3. Selector de Talla con Pills Limpias y Compactas */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>TALLA:</span>
            {selectedVariant && (
              <span className="text-primary font-black">
                {selectedVariant.size}
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-[11px] text-primary hover:text-white font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="underline underline-offset-4">Guía de Medidas (CM)</span>
          </button>
        </div>

        {/* Grid de Pills de Tallas 100% Limpias (h-10 compacto) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                className={`h-10 rounded-lg font-mono font-bold text-xs uppercase transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-foreground text-background shadow-md font-black scale-102 border-2 border-foreground"
                    : isAvailable
                    ? "bg-surface hover:bg-surface-elevated text-foreground border border-border-subtle hover:border-border-strong"
                    : "bg-surface/30 text-muted-foreground/30 border border-transparent line-through cursor-not-allowed"
                }`}
                title={isAvailable ? `Talla ${size} (${variantForSize?.stockQuantity} piezas)` : `Talla ${size} Agotada`}
              >
                <span>{size}</span>
              </button>
            );
          })}
        </div>

        {/* Alerta de Stock Bajo Contextual y Elegante */}
        {isLowStock && (
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-2 rounded-lg backdrop-blur-md animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>¡Atención! Solo quedan {selectedVariant.stockQuantity} piezas en talla {selectedVariant.size}.</span>
          </div>
        )}
      </div>

      {/* 4. Selector de Cantidad y Botón Principal de Compra (-12% de altura: h-12) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex gap-2.5">
          {/* Contador de Cantidad */}
          <div className="flex items-center border border-border-subtle rounded-xl bg-surface px-1 shrink-0 h-12">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-full flex items-center justify-center text-foreground font-bold hover:text-primary disabled:opacity-30 text-base"
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-sm text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
              disabled={quantity >= selectedVariant.stockQuantity || isOutOfStock}
              className="w-8 h-full flex items-center justify-center text-foreground font-bold hover:text-primary disabled:opacity-30 text-base"
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
            className={`flex-1 h-12 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? "bg-surface-elevated text-muted-foreground border border-border-subtle cursor-not-allowed opacity-60"
                : isAdded
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 active:scale-98"
            }`}
          >
            {isOutOfStock ? (
              <span>AGOTADO TEMPORALMENTE</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>¡AGREGADO A LA BOLSA!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>AGREGAR A LA BOLSA • {formatPrice(price * quantity)}</span>
              </>
            )}
          </button>
        </div>

        {/* Garantías Rápidas Compactas */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border-subtle">
            <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Envío gratis &gt;$1,299 MXN</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-border-subtle">
            <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">1er cambio gratis</span>
          </div>
        </div>
      </div>

      {/* 5. Acordeones Técnicos Más Esbeltos */}
      <div className="border-t border-border-subtle pt-2.5 divide-y divide-border-subtle">
        {/* Acordeón 1: Composición y Tejido */}
        <div className="py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion("fabric")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              DETALLES TÉCNICOS & COMPOSICIÓN
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "fabric" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "fabric" && (
            <div className="pt-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed animate-in fade-in duration-200">
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
        <div className="py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion("shipping")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-primary" />
              ENVÍOS & TIEMPOS DE ENTREGA
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "shipping" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "shipping" && (
            <div className="pt-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed animate-in fade-in duration-200">
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
        <div className="py-2.5">
          <button
            type="button"
            onClick={() => toggleAccordion("returns")}
            className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              GARANTÍA DE AJUSTE (CAMBIOS FÁCILES)
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                openAccordion === "returns" ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          {openAccordion === "returns" && (
            <div className="pt-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed animate-in fade-in duration-200">
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
