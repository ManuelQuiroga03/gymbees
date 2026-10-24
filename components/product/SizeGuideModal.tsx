"use client";

import React from "react";
import { X, Ruler, UserCheck, HelpCircle } from "lucide-react";
import { ProductFit } from "@/types/commerce";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitType?: ProductFit;
}

export function SizeGuideModal({ isOpen, onClose, fitType = "oversized" }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-border-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md px-6 py-4 border-b border-border-subtle flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <h3 className="font-display text-2xl uppercase tracking-wider text-foreground">
              GUÍA DE MEDIDAS Y TALLAJE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Escala Visual de Ajuste */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-2">
              ESCALA DE SILUETA DE ESTA PRENDA
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold mt-2">
              <div className={`p-2 rounded border ${fitType === "compression" ? "bg-primary text-primary-foreground border-primary" : "border-border-subtle text-muted-foreground"}`}>
                Compresión
              </div>
              <div className={`p-2 rounded border ${fitType === "regular" ? "bg-primary text-primary-foreground border-primary" : "border-border-subtle text-muted-foreground"}`}>
                Regular
              </div>
              <div className={`p-2 rounded border ${fitType === "oversized" ? "bg-primary text-primary-foreground border-primary" : "border-border-subtle text-muted-foreground"}`}>
                Oversized ★
              </div>
              <div className={`p-2 rounded border ${fitType === "athletic" ? "bg-primary text-primary-foreground border-primary" : "border-border-subtle text-muted-foreground"}`}>
                Athletic Baggy
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {fitType === "oversized" && "Corte amplio con caída intencional en hombros. Te recomendamos pedir tu talla habitual para un fit streetwear relajado, o una talla menos si prefieres un ajuste más entallado."}
              {fitType === "compression" && "Ajuste tipo segunda piel ceñido al cuerpo. Favorece la definición muscular y retiene calor. Pide tu talla usual o una más si estás entre dos medidas."}
              {fitType === "regular" && "Ajuste tradicional con espacio cómodo en torso y cintura. Ideal para entrenamiento y uso diario."}
              {fitType === "athletic" && "Silueta anatómica con amplitud en cuadríceps y hombros sin perder ajuste en muñecas o cintura."}
            </p>
          </div>

          {/* Referencia Física del Atleta */}
          <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4">
            <UserCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-foreground uppercase tracking-wider block">
                REFERENCIA REAL DEL MODELO EN FOTOGRAFÍA
              </span>
              <p className="text-muted-foreground">
                El atleta en fotos mide <strong className="text-foreground">1.82 m</strong>, pesa <strong className="text-foreground">88 kg</strong> (complexión atlética) y viste <strong className="text-primary font-black">Talla L</strong> para un look oversized característico de Gymbees.
              </p>
            </div>
          </div>

          {/* Tabla de Medidas en CM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3 flex items-center justify-between">
              <span>MEDIDAS DE LA PRENDA EN PLANO (CM)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Tolerancia ±1.5 cm</span>
            </h4>
            
            <div className="overflow-x-auto border border-border-subtle rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] font-mono tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="py-3 px-4 font-bold text-foreground">Talla</th>
                    <th className="py-3 px-4">Pecho (Ancho)</th>
                    <th className="py-3 px-4">Largo Total</th>
                    <th className="py-3 px-4">Hombro a Hombro</th>
                    <th className="py-3 px-4">Manga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-mono">
                  <tr className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">S</td>
                    <td className="py-3 px-4 text-muted-foreground">56 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">72 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">53 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">22 cm</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">M</td>
                    <td className="py-3 px-4 text-muted-foreground">59 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">75 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">56 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">23 cm</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50 transition-colors bg-primary/5">
                    <td className="py-3 px-4 font-bold text-primary">L (Recomendada)</td>
                    <td className="py-3 px-4 text-foreground font-bold">62 cm</td>
                    <td className="py-3 px-4 text-foreground font-bold">78 cm</td>
                    <td className="py-3 px-4 text-foreground font-bold">59 cm</td>
                    <td className="py-3 px-4 text-foreground font-bold">24 cm</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">XL</td>
                    <td className="py-3 px-4 text-muted-foreground">65 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">81 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">62 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">25 cm</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">2XL</td>
                    <td className="py-3 px-4 text-muted-foreground">68 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">83 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">65 cm</td>
                    <td className="py-3 px-4 text-muted-foreground">26 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cómo Medirse en Casa */}
          <div className="border-t border-border-subtle pt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" />
              ¿CÓMO MEDIRTE CORRECTAMENTE?
            </span>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Coloca una playera que te guste cómo te queda estirada sobre una mesa plana.</li>
              <li><strong>Pecho:</strong> Mide de sisa a sisa (de axila a axila) en línea recta.</li>
              <li><strong>Largo:</strong> Mide desde el punto más alto del cuello hasta la bastilla inferior.</li>
              <li>Si estás entre dos tallas, te sugerimos ir por la más grande para mantener el estilo streetwear pesado.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-elevated px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            🛡️ 1er cambio de talla sin costo de flete en todo México.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
}
