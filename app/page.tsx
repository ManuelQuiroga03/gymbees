import { getFeaturedProducts, getAllCategories } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { BentoCategories } from "@/components/home/BentoCategories";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export const revalidate = 0; // Datos frescos en cada petición

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Bento Grid de Categorías Asimétrico */}
      <BentoCategories categories={categories} />

      {/* 3. Drop Activo con Quick-Add */}
      <section id="drop" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>INVENTARIO CONECTADO EN TIEMPO REAL</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-foreground">
              EQUIPAMIENTO MÁS CODICIADO
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            Piezas limitadas por Drop. Selecciona tu talla directamente en la tarjeta para añadir a tu bolsa con un solo clic.
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-surface border border-border-subtle rounded-2xl p-12 text-center text-muted-foreground">
            <p className="font-display text-2xl text-foreground uppercase">
              No se encontraron productos activos en la base de datos
            </p>
            <p className="text-xs mt-2">
              Verifica que el contenedor de Podman esté corriendo en el puerto 5432.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Social Proof & Community Strip */}
      <section className="py-20 bg-surface/50 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">
            #GYMBEESHEAVYCLUB
          </span>
          <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-wider text-foreground">
            COMUNIDAD DE LEVANTAMIENTO EN MÉXICO
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Más de 1,200 atletas y levantadores pesados confían en la resistencia de nuestras costuras y el gramaje de 240+ GSM.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>4.9 / 5 ESTRELLAS EN RESEÑAS</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>100% SATISFACCIÓN O CAMBIO SIN COSTO</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
