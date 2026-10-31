"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/types/commerce";

interface BentoCategoriesProps {
  categories?: Category[];
}

const DEFAULT_CATEGORIES: Array<{
  slug: string;
  title: string;
  tag: string;
  description: string;
  href: string;
  imageUrl: string;
}> = [
  {
    slug: "pump-covers",
    title: "PUMP COVERS (OVERSIZED)",
    tag: "240+ GSM HEAVYWEIGHT",
    description: "Corte amplio con hombros caídos para cubrir y revelar el físico con caída impecable.",
    href: "/categoria/pump-covers",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200",
  },
  {
    slug: "compresion",
    title: "COMPRESSION WEAR",
    tag: "4-WAY STRETCH",
    description: "Elasticidad técnica para soporte muscular durante series pesadas.",
    href: "/categoria/compresion",
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "bottoms",
    title: "BAGGYS & BOTTOMS",
    tag: "GOLDEN ERA MOBILITY",
    description: "Pants de máxima movilidad para días de pierna y sentadillas pesadas.",
    href: "/categoria/bottoms",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "accesorios",
    title: "ACCESORIOS DE FUERZA",
    tag: "HEAVY CLUB ESSENTIALS",
    description: "Straps de levantamiento, muñequeras reforzadas y calcetas tubulares.",
    href: "/categoria/accesorios",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
  },
];

export function BentoCategories({ categories }: BentoCategoriesProps) {
  // Combinar configuración estructural de layout con datos dinámicos (imágenes/tags de BD)
  const items = DEFAULT_CATEGORIES.map((def) => {
    const fromDb = categories?.find((c) => c.slug === def.slug);
    return {
      ...def,
      title: fromDb?.name || def.title,
      tag: fromDb?.tag || def.tag,
      description: fromDb?.description || def.description,
      imageUrl: fromDb?.imageUrl || def.imageUrl,
    };
  });

  return (
    <section id="categories" className="py-20 border-b border-border-subtle max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Encabezado de Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            TAXONOMÍA DE ENTRENAMIENTO
          </span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-foreground mt-1">
            CATEGORÍAS ESENCIALES
          </h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Prendas categorizadas por tipo de silueta y ajuste para que encuentres la medida exacta de tu entrenamiento.
        </p>
      </div>

      {/* Showcase Editorial de 4 Columnas Uniformes (Estilo YoungLA / Represent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {items.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative rounded-2xl border border-border-subtle hover:border-border-strong overflow-hidden flex flex-col justify-between p-6 sm:p-7 transition-all duration-500 shadow-xl hover:shadow-2xl aspect-[3/4] min-h-[400px] sm:min-h-[440px]"
          >
            {/* Imagen de Fondo con Micro-Zoom Cinemático */}
            {cat.imageUrl && (
              <img
                src={cat.imageUrl}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}

            {/* Capa de Gradiente Oscuro para Legibilidad Superior */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/15 group-hover:via-black/40 transition-colors duration-500" />

            {/* Parte Superior: Tag Badge + Flecha de Acción */}
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary bg-black/80 border border-white/10 px-2.5 py-1 rounded-md backdrop-blur-md shadow-md uppercase">
                {cat.tag}
              </span>
              <div className="w-8 h-8 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 group-hover:bg-black/90 transition-all backdrop-blur-md shadow-md">
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Parte Inferior: Título y Descripción */}
            <div className="relative z-10 mt-auto pt-8">
              <h3 className="font-display text-2xl tracking-wide text-white uppercase group-hover:text-primary transition-colors duration-300 drop-shadow-sm">
                {cat.title}
              </h3>
              <p className="text-xs text-neutral-300/90 mt-1 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
