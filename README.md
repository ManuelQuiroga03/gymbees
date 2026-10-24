# 🐝 Gymbees Heavy Club — E-Commerce D2C

Plataforma de comercio electrónico de alto rendimiento desarrollada a medida para **Gymbees México**, especializada en indumentaria deportiva *heavyweight* (240+ GSM), *pump covers* y streetwear atlético de alta densidad.

Diseñada bajo arquitectura **Mobile-First**, principios **CRO (Conversion Rate Optimization)** y desacoplamiento frontend/backend mediante contratos estrictos en TypeScript.

---

## ⚡ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend & SSR** | [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Estilos & UI Kit** | [Tailwind CSS](https://tailwindcss.com/) + Microinteracciones personalizadas + Iconografía [Lucide](https://lucide.dev/) |
| **Base de Datos** | [PostgreSQL 16](https://www.postgresql.org/) (Compatible con Supabase Cloud) con transacciones atómicas `FOR UPDATE` |
| **Pasarela de Pagos** | [Mercado Pago SDK v2](https://www.mercadopago.com.mx/developers) (Checkout Pro con Tarjetas, Saldo MP y OXXO Pay) |
| **Autenticación & Seguridad** | [JOSE (JWT cifrado)](https://github.com/panva/jose) + Cookies HttpOnly + Hashing con [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Contenedores** | Docker Compose / Podman para base de datos y entorno local reproducible |

---

## 🚀 Características Principales

### 🛒 1. Experiencia de Compra & Conversión (CRO)
* **Página de Inicio de Alto Impacto:**
  - *Sticky Announcement Bar* rotativa con incentivo de envío gratis y pago quincenal.
  - Hero editorial de alto contraste y *Bento Grid* de descubrimiento por categorías.
  - Catálogo principal con **Quick-Add** para comprar por talla en 1 solo clic.
* **Ficha de Producto Detallada (PDP - `/producto/[slug]`):**
  - Galería visual con zoom de textura de tela (240+ GSM) y badges de calidad.
  - Selector de tallas en pastillas (*Pills*) con disparadores de escasez (*"¡Últimas piezas!"*).
  - **Modal Interactivo de Guía de Medidas:** Medidas en plano (cm) para pecho, largo, hombro y manga, junto con referencia física del atleta modelo (1.82 m, 88 kg, Talla L).
  - **Sticky Add-to-Cart Móvil:** Barra fija inferior que aparece automáticamente al hacer scroll rebasando el botón principal.
  - Acordeones colapsables para composición, tiempos de despacho DHL/Estafeta y garantía de 30 días con 1er cambio de talla gratis.
* **Navegación por Colecciones (`/categoria/[slug]`):**
  - Vistas dedicadas para *Pump Covers*, *Compresión*, *Bottoms* y *Accesorios*.
  - Filtros dinámicos por tipo de silueta (*Oversized*, *Compresión*, *Regular*) y ordenamiento por precio.
* **Drawer Cart Reactivo:**
  - Carrito deslizable lateral con barra de progreso interactiva hacia el umbral de envío gratis (>$1,299 MXN).
  - Persistencia de estado en cliente (`localStorage`).

### 💳 2. Checkout & Pagos con Mercado Pago
* Formulario mobile-friendly optimizado para México con validaciones en tiempo real:
  - Teléfono móvil restringido estrictamente a 10 dígitos numéricos.
  - Correo electrónico con validación canónica por regex.
  - Código postal de 5 dígitos.
* Integración con **Mercado Pago Checkout Pro**:
  - Creación de preferencia con desglose de prendas, variantes de talla, costo de envío y cupones de descuento.
  - Pagos seguros con Tarjeta de Crédito/Débito (hasta 12 mensualidades), Saldo de Mercado Pago o Efectivo en OXXO Pay.
  - **Webhook Idempotente (`/api/webhooks/mercadopago`):** Procesa eventos de pago en segundo plano y actualiza el estado de las órdenes automáticamente.

### 🛡️ 3. Transaccionalidad & Control de Inventario
* **Reserva Atómica de Stock:** Bloqueo de filas en PostgreSQL (`SELECT ... FOR UPDATE`) durante el checkout para prevenir sobreventas (*overselling*) durante lanzamientos masivos (*Drops*).
* **Motor de Cupones de Descuento:** Validación de códigos fijos o porcentuales con monto mínimo de compra y control de usos concurrentes.

### 👑 4. Panel de Administración (`/admin`)
* Gestión integral de catálogo: creación y edición de productos, siluetas, gramajes e imágenes.
* Control de stock unitario por variante (SKU).
* Generador de cupones de descuento con límites de uso y vigencia.
* Monitor de órdenes y estados de pago en tiempo real.

---

## 📂 Estructura del Proyecto

```
gymbees_ecommerce/
├── app/                        # Next.js 15 App Router
│   ├── admin/                  # Panel administrativo
│   ├── api/                    # Route Handlers (Auth, Orders, Webhooks, Admin)
│   ├── categoria/[slug]/       # Páginas dinámicas de colecciones
│   ├── checkout/               # Formulario de checkout
│   ├── login/                  # Autenticación de usuarios
│   ├── mis-pedidos/            # Historial de compras del cliente
│   ├── orden/[orderNumber]/    # Ticket de confirmación de pedido
│   ├── producto/[slug]/        # Ficha de producto (PDP) interactiva
│   ├── layout.tsx              # Root Layout con Header, CartDrawer y Footer
│   └── page.tsx                # Página de inicio
├── components/                 # Componentes modulares
│   ├── cart/                   # Drawer Cart y componentes de bolsa
│   ├── category/               # Vista de catálogo y filtros
│   ├── home/                   # Hero y Bento Grid
│   ├── layout/                 # Header, Footer, AnnouncementBar
│   └── product/                # ProductCard, Gallery, Details, StickyBar, SizeGuide
├── context/                    # Contextos globales (CartContext, AuthContext)
├── docker/                     # Esquemas SQL iniciales y migraciones
├── docs/                       # Especificaciones técnicas, auditoría UX y seguridad
├── lib/                        # Clientes de BD (pg), Auth (JWT), Mercado Pago y utilidades
├── public/                     # Assets estáticos y logos vectoriales
├── types/                      # Contratos TypeScript de comercio electrónico
└── docker-compose.yml          # Setup local de PostgreSQL 16 y PgWeb
```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/ManuelQuiroga03/gymbees.git
cd gymbees
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla de entorno:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
# Conexión PostgreSQL Local
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/gymbees_db?sslmode=disable

# URL Base
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credenciales de Mercado Pago (Sandbox / Producción)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token
```

### 4. Iniciar base de datos local
Con Docker o Podman:
```bash
docker compose up -d
```
*(El script `docker/init.sql` inicializará automáticamente las tablas, índices y productos base).*

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📖 Documentación de Arquitectura

En la carpeta [`/docs`](./docs) encontrarás las especificaciones completas del sistema:
* **`01_AUDIT_UI_UX_CRO_REPORT.md`**: Auditoría heurística de conversión, benchmarks (Gymshark, YoungLA) y wireframes mobile-first.
* **`02_ARCHITECTURE_SPECIFICATION.md`**: Especificación de arquitectura, modelo ER, contratos de datos y plan de sprints.
* **`03_BRAND_DESIGN_SYSTEM.md`**: Tokens de diseño, tipografía y paleta de colores.
* **`04_SECURITY_AND_HARDENING_GUIDE.md`**: Guía de hardening de seguridad, prevención de OWASP y defensa en profundidad.

---

## 📜 Licencia

Desarrollado para **Gymbees México**. Todos los derechos reservados © 2026.
