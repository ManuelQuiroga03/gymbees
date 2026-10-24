"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, User, Phone, ShieldCheck, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { loginUser } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, fullName, phone };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      // Actualizar estado global inmediatamente
      if (data.user) {
        loginUser(data.user);
      }

      // Si el rol es admin y no había redirect específico, enviar al panel admin
      if (data.user?.role === "admin" && redirectPath === "/") {
        router.push("/admin");
      } else {
        router.push(redirectPath);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@gymbees.com");
    setPassword("admin123");
    setMode("login");
  };

  const fillDemoCustomer = () => {
    setEmail("usuario@gymbees.com");
    setPassword("usuario123");
    setMode("login");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Logo and Heading */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto mb-2">
            <Image
              src="/images/logo/white_bee.png"
              alt="Gymbees Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            CLUB DE FUERZA
          </span>
          <h1 className="font-display text-4xl uppercase tracking-wider text-foreground">
            {mode === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Accede a tu historial de pedidos y beneficios de drop."
              : "Regístrate para comprar y rastrear tus paquetes en México."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface-elevated rounded-xl border border-border-subtle text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === "login"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === "register"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-200 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Carlos Mendoza"
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Teléfono (WhatsApp México)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@gymbees.mx"
                className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <span>{loading ? "PROCESANDO..." : mode === "login" ? "INGRESAR AL SITIO" : "CREAR MI CUENTA"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-border-subtle text-center space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            ACCESO RÁPIDO DE PRUEBA (DESARROLLO):
          </span>
          <div className="flex justify-center gap-2">
            <button
              onClick={fillDemoAdmin}
              className="bg-surface-elevated hover:bg-border-subtle text-[11px] font-bold text-foreground px-3 py-1.5 rounded-lg border border-border-subtle transition-colors"
            >
              👑 Cargar Admin
            </button>
            <button
              onClick={fillDemoCustomer}
              className="bg-surface-elevated hover:bg-border-subtle text-[11px] font-bold text-foreground px-3 py-1.5 rounded-lg border border-border-subtle transition-colors"
            >
              🏋️ Cargar Atleta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs text-muted-foreground">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
