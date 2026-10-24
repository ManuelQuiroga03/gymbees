import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "PUMP COVERS (OVERSIZED)",
    tag: "240+ GSM HEAVYWEIGHT",
    description: "Corte amplio con hombros caídos para cubrir y revelar el físico.",
    href: "/categoria/pump-covers",
    span: "md:col-span-2",
  },
  {
    title: "COMPRESSION WEAR",
    tag: "4-WAY STRETCH",
    description: "Elasticidad técnica para soporte muscular durante series pesadas.",
    href: "/categoria/compresion",
    span: "md:col-span-1",
  },
  {
    title: "BAGGYS & BOTTOMS",
    tag: "GOLDEN ERA MOBILITY",
    description: "Pants de máxima movilidad para días de pierna y sentadillas.",
    href: "/categoria/bottoms",
    span: "md:col-span-1",
  },
  {
    title: "ACCESORIOS DE FUERZA",
    tag: "HEAVY CLUB ESSENTIALS",
    description: "Straps de levantamiento, muñequeras reforzadas y calcetas.",
    href: "/categoria/accesorios",
    span: "md:col-span-2",
  },
];

export function BentoCategories() {
  return (
    <section id="categories" className="py-20 border-b border-border-subtle max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className={`group bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-border-strong rounded-2xl p-8 flex flex-col justify-between min-h-[220px] transition-all relative overflow-hidden ${cat.span}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary bg-background/80 border border-border-subtle px-2.5 py-1 rounded">
                {cat.tag}
              </span>
              <div className="w-9 h-9 rounded-full bg-background border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-all">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-display text-3xl tracking-wide text-foreground uppercase group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
