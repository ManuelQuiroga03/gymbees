# Guía de Seguridad Defensiva, Hardening y Mitigación de Vulnerabilidades
**Proyecto:** E-commerce Gymbees (`gymbees.mx`)  
**Stack:** Next.js (App Router) + Supabase (PostgreSQL) + Vercel + Mercado Pago / Stripe  
**Rol:** Chief Information Security Officer (CISO) & Principal Security Engineer  

---

## 1. El Panorama Real de Amenazas en E-commerce Moderno

Las noticias sobre vulnerabilidades críticas en Node.js, PHP y paquetes de código abierto suelen deberse a tres vectores principales:
1. **Ataques a la Cadena de Suministro (Supply Chain Attacks):** Paquetes maliciosos en npm, *typosquatting* o dependencias comprometidas que roban variables de entorno (`ENV`).
2. **Servidores Tradicionales Expuestos (VPS / CPanel / Docker mal configurados):** Servidores Node.js o PHP permanentes donde un atacante logra ejecución remota de código (RCE) e instala un *ransomware* o una puerta trasera persistente.
3. **Fallos en la Lógica Transaccional (OWASP Top 10):** Alteración de precios en el cliente, *race conditions* en inventario, inyección SQL, bypass de webhooks de pago y *card testing* (bots probando tarjetas robadas en tu pasarela).

---

## 2. La Matriz de Defensa en Profundidad (Cero Confianza / Zero Trust)

Para Gymbees, la seguridad no es un parche que se agrega al final; está embebida en la arquitectura de 5 capas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE SEGURIDAD 5 CAPAS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. EDGE & NETWORK (Vercel)       ➔ WAF, DDoS Shield, Edge Rate Limiting     │
│ 2. RUNTIME (Serverless Functions)➔ MicroVMs efímeras de solo lectura         │
│ 3. APPLICATION (Next.js + Zod)   ➔ Validación estricta de esquemas, CSP     │
│ 4. DATA ENGINE (Supabase RLS)    ➔ Reglas a nivel de fila en PostgreSQL     │
│ 5. PAYMENTS (Stripe / MP SDK)    ➔ Firmas HMAC y conciliación en el servidor│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Capa 1: Por qué Vercel Serverless Elimina el 90% del Riesgo de Servidor Tradicional
En un servidor Node.js o PHP clásico (un VPS con Ubuntu + Nginx + PM2):
* Si una librería tiene un fallo RCE, el atacante toma control del sistema operativo, roba la base de datos y mantiene persistencia indefinida.

**Cómo nos protege nuestra arquitectura Serverless en Vercel:**
* **MicroVMs Efímeras (Firecracker):** Cada petición se ejecuta en una función serverless aislada que vive únicamente por milisegundos y luego se destruye.
* **Sistema de Archivos de Solo Lectura:** El disco del servidor es inmutable. Un atacante no puede escribir scripts en disco, ni instalar demonios, ni alterar el código fuente en ejecución.
* **Aislamiento de Memoria:** No hay memoria compartida entre sesiones de distintos usuarios.

---

### Capa 2: Blindaje contra Ataques a la Cadena de Suministro (npm Supply Chain)

1. **Adopción de shadcn/ui en lugar de librerías de componentes empaquetadas:**
   * Las librerías de componentes tradicionales instalan decenas de dependencias opacas en `node_modules`. 
   * **shadcn/ui** copia el código fuente de los componentes (botones, modales, drawers) directamente dentro de nuestro repositorio (`/components/ui`). El código es 100% visible, editable y auditable por nosotros.
2. **Fijación Estricta de Dependencias:**
   * Uso de lockfile estricto (`package-lock.json` o `pnpm-lock.yaml`) para impedir que versiones manipuladas se instalen silenciosamente en el despliegue.
3. **Escaneo Automatizado de Vulnerabilidades (CI/CD):**
   * Configuración de `npm audit --production` y Dependabot de GitHub para alertar y bloquear automáticamente cualquier CVE en dependencias antes de que llegue a producción.

---

### Capa 3: Validación Estricta con Zod y Prevención de Inyecciones

En Next.js nunca confiamos en los datos que llegan desde el navegador:

```typescript
// lib/validations/checkout.ts
import { z } from 'zod';

export const CheckoutPayloadSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().uuid({ message: "ID de variante inválido" }),
      quantity: z.number().int().min(1).max(5, "Límite de 5 piezas por prenda")
    })
  ).min(1, "El carrito no puede estar vacío"),
  customer: z.object({
    email: z.string().email("Correo inválido").trim().toLowerCase(),
    fullName: z.string().min(3).max(100).trim(),
    phone: z.string().regex(/^[0-9]{10}$/, "Teléfono debe ser de 10 dígitos (México)")
  }),
  shippingAddress: z.object({
    postalCode: z.string().regex(/^[0-9]{5}$/, "Código postal de 5 dígitos"),
    street: z.string().min(5).max(150),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50)
  })
}).strict(); // .strict() RECHAZA cualquier propiedad extra inyectada por un atacante
```

---

### Capa 4: Row Level Security (RLS) en Supabase (Defensa de Datos Profunda)

Incluso si un atacante encontrara una forma de invocar directamente la API de Supabase desde su navegador con la clave pública anónima:
* **PostgreSQL evalúa la seguridad en el motor de base de datos.**
* Una consulta como `SELECT * FROM orders` sólo retornará las órdenes que pertenezcan al usuario autenticado (`auth.uid() = user_id`).
* Cualquier intento de modificar inventario, cambiar precios o insertar órdenes directamente es abortado con un error `403 Forbidden` a nivel del kernel de Postgres.

---

### Capa 5: Pasarela de Pagos Segura (Anti-Fraude y Anti-Tampering)

1. **Verificación Criptográfica de Webhooks:**
   * El endpoint `/api/webhooks/mercadopago` o `/api/webhooks/stripe` valida la firma criptográfica (HMAC-SHA256) antes de tocar la base de datos. Peticiones falsificadas son descartadas con `401 Unauthorized`.
2. **Cálculo de Precios del Lado del Servidor:**
   * El cliente solo solicita los SKUs y cantidades. El backend calcula el total oficial consultando la base de datos. Es físicamente imposible comprar una prenda de \$649 MXN por \$1 MXN.
3. **Rate Limiting Anti-Carding:**
   * Protección en los endpoints de checkout para limitar a 5 intentos por IP cada 10 minutos, previniendo ataques de fuerza bruta o pruebas de tarjetas robadas.

---

## 3. Headers de Seguridad HTTP Obligatorios (`next.config.mjs`)

```javascript
// Cabeceras HTTP de nivel bancario aplicadas a todo el sitio
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' }, // Previene Clickjacking
  { key: 'X-Content-Type-Options', value: 'nosniff' }, // Previene MIME-sniffing
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { 
    key: 'Content-Security-Policy', 
    value: "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.mercadopago.com; connect-src 'self' https://*.supabase.co https://api.mercadopago.com;" 
  }
];
```
