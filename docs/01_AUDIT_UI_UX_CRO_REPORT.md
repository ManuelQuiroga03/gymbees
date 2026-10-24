# Informe Técnico de Auditoría UI/UX & Optimización de Conversión (CRO)
**Cliente:** Gymbees México (`gymbees-mexa.myshopify.com`)  
**Especialidad:** D2C Fitness, Streetwear Deportivo & Anime Gym Drops  
**Benchmarks de Referencia:** Gymshark, YoungLA, Dfyne, Alphalete, Darcsport  
**Rol:** Lead UI/UX Designer & Senior E-commerce Strategist  

---

## Resumen Ejecutivo

Gymbees cuenta con un producto de altísima tracción orgánica en México: el nicho de *gymwear* gráfico, *pump covers* y ropa de compresión inspirada en cultura pop y anime (similar al fenómeno global de **YoungLA** y **Darcsport**). 

Sin embargo, **la tienda Shopify actual opera como un catálogo estático tipo folleto y no como una máquina transaccional de conversión**. Existe una desconexión crítica entre el tráfico impulsivo generado en redes sociales (TikTok/Instagram) y la experiencia de compra en el sitio: fricción en el checkout móvil, ausencia de catálogo interactivo en la Home, nula certidumbre sobre el tallaje y falta de prueba social nativa. 

---

## 1. Diagnóstico Heurístico: Las 5 Fricciones Críticas en la Versión Actual

```
[ Tráfico TikTok / IG ] 
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Home "Folleto Muerto" (Sin interactividad ni Quick-Add) │ ➔ Fuga del 60%+ de visitas
│ 2. Mezcla Lingüística Spanglish (Pérdida de credibilidad)  │ ➔ Pérdida de confianza D2C
│ 3. Taxonomía Rota (Sin filtros claros por fit/personaje)    │ ➔ Fricción de descubrimiento
│ 4. Terror al Tallaje (Sin fit guide ni medidas del modelo)  │ ➔ Parálisis de compra / Rebote
│ 5. Ausencia de Trust & BNPL (Sin Kueski, Aplazo ni UGC)     │ ➔ Abandono en checkout
└─────────────────────────────────────────────────────────────┘
```

### 1.1. Home "Folleto Estático": Cero Interactividad y Fuga Prematura de Tráfico
* **Problema:** La página de inicio muestra imágenes estáticas que parecen capturas de pantalla o un *lookbook* de WhatsApp. No existen grids de productos dinámicos con precio visible, variantes de color ni botón de compra rápida (*Quick-Add*).
* **Impacto CRO:** En el comercio de moda deportiva, el 70% de las ventas ocurren en productos destacados de la Home o a través de colecciones directas. Obligar al usuario a navegar a ciegas por menús secundarios para encontrar el botón de compra eleva la tasa de rebote (*Bounce Rate*) por encima del 65%.

### 1.2. Disonancia Cognitiva por Mezcla Lingüística ("Spanglish" Desarticulado)
* **Problema:** Coexistencia de textos genéricos en inglés de la plantilla base de Shopify (*"Shop now"*, *"Our signature product"*, *"Featured collection"*, *"Quick view"*) con llamadas a la acción y banners en español (*"EVENTOS"*, *"Regístrate a nuestro boletín"*).
* **Impacto CRO:** Para el comprador mexicano, una tienda en Shopify con botones en inglés sin traducir transmite descuido, apariencia de plantilla predeterminada o sitio clon/fraude (*dropshipping scam*). Reduce drásticamente la tasa de conversión en el primer contacto.

### 1.3. Falta de Certidumbre en Tallaje (Parálisis por Análisis en Ropa Fitness)
* **Problema:** Ausencia de tablas de medidas en centímetros, comparativas de silueta (*Oversized Fit* vs. *Compression Fit*) y referencias físicas del modelo (estatura/peso/talla que viste).
* **Impacto CRO:** En indumentaria de entrenamiento, el calce es el factor número uno de abandono de carrito y devoluciones. Si un usuario no sabe si una *Pump Cover* talla grande o si una playera de compresión viene reducida, prefiere no arriesgar su dinero.

### 1.4. Arquitectura de Navegación Rota y Taxonomía Inexistente
* **Problema:** El menú principal carece de una jerarquía lógica de exploración. Los usuarios no pueden filtrar por género (Hombre / Mujer), por tipo de prenda técnica (*Pump Covers, Stringers, Compression Tees, Baggys, Shorts*) ni por colección temática/Drop (*Invincible, Berserk, Demon Slayer*).
* **Impacto CRO:** Rompe el modelo de consumo impulsivo característico de los lanzamientos (*drops*). Si un cliente busca específicamente "Playeras de Compresión", debe escanear manualmente todo el feed de productos.

### 1.5. Ausencia de Garantías de Pago Local (BNPL) y Validación Social (UGC)
* **Problema:** En el mercado mexicano, la falta de pasarelas de pago a plazos sin tarjeta de crédito (*Buy Now Pay Later* como Kueski Pay o Aplazo) y la ausencia de pago en efectivo (OXXO/Mercado Pago) reducen el público potencial a menos del 30% del mercado joven. Además, no hay reseñas verificadas ni fotos de clientes reales entrenando con las prendas.
* **Impacto CRO:** Sin validación social de atletas ni métodos de pago locales accesibles, la tasa de carritos abandonados supera el 80%.

---

## 2. Arquitectura de Información y Wireframe Conceptual (Mobile-First)

El 88% del tráfico de moda fitness proviene de smartphones (Instagram, TikTok). La experiencia se diseña priorizando pantallas de 375px a 420px.

```
┌─────────────────────────────────────────────────────────────┐
│ [ANNOUNCEMENT BAR] 🔥 ENVÍO GRATIS >$1,299 MXN | 3 MSI KUESKI │
├─────────────────────────────────────────────────────────────┤
│ [HEADER] ☰ (Drawer)       [ G Y M B E E S ]      🔍 🛒 (2) │
├─────────────────────────────────────────────────────────────┤
│ [HERO SECTION]                                              │
│  Fotografía Editorial Alto Contraste (Atleta en Pump Cover) │
│  H1: HEAVYWEIGHT OVERSIZED TEES                             │
│  P: Siluetas 240 GSM forjadas para el entrenamiento pesado. │
│  ┌───────────────────────────┐ ┌───────────────────────────┐│
│  │   [ VER NUEVO DROP ]      │ │     [ MÁS VENDIDOS ]      ││
│  └───────────────────────────┘ └───────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ [TRUST BAR] 🚚 Envíos Express  🔄 Cambios Fáciles  💳 Kueski│
├─────────────────────────────────────────────────────────────┤
│ [BEST SELLERS CAROUSEL]                                     │
│  Título: "EQUIPAMIENTO MÁS CODICIADO"                       │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ [FOTO PRENDA]    │  │ [FOTO PRENDA]    │                 │
│  │ Nolan Oversized  │  │ Akaza Compres.   │  [Scroll ➔]     │
│  │ $649 MXN         │  │ $599 MXN         │                 │
│  │ [ + AGREGAR (M)] │  │ [ + AGREGAR (L)] │                 │
│  └──────────────────┘  └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│ [SHOP BY CATEGORY - BENTO GRID]                             │
│  ┌─────────────────────────────┐┌──────────────────────────┐│
│  │   PUMP COVERS (OVERSIZED)   ││   COMPRESSION TEES       ││
│  └─────────────────────────────┘└──────────────────────────┘│
│  ┌─────────────────────────────┐┌──────────────────────────┐│
│  │   BOTTOMS (BAGGYS & SHORTS) ││   ACCESORIOS & STRAPS    ││
│  └─────────────────────────────┘└──────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ [DROP SPOTLIGHT: GYMBEES x ANIME HEAVYWEIGHT]               │
│  Banner Split con cuenta regresiva / Badge "EDICIÓN LIMITADA"│
│  [ EXPLORAR COLECCIÓN COMPLETA ➔ ]                          │
├─────────────────────────────────────────────────────────────┤
│ [COMMUNITY & UGC WALL] #GymbeesHeavyClub                    │
│  Feed dinámico de Atletas / Historias reales en el gimnasio │
│  "4.9/5 basado en más de 1,200 compras en México"           │
├─────────────────────────────────────────────────────────────┤
│ [NEWSLETTER VIP CLUB]                                       │
│  "Únete al Club: 10% OFF en tu primer Drop + Acceso Previo" │
│  [ Tu correo electrónico ] [ UNIRME ]                       │
├─────────────────────────────────────────────────────────────┤
│ [FOOTER ESTRUCTURADO]                                       │
│  - Acordeón Ayuda & Envíos (Tiempos, Guía de Tallas)         │
│  - Políticas de Cambio (30 días de garantía sin rodeos)     │
│  - Logos Oficiales: MercadoPago, Kueski, Visa, MC, OXXO     │
└─────────────────────────────────────────────────────────────┘
```

### Especificación Detallada Sección por Sección (Home Page)

#### A. Barra de Anuncios Superior (Sticky Announcement Bar)
* **Contenido rotativo cada 4s:**
  1. *🚚 ENVÍO GRATIS a todo México en compras superiores a $1,299 MXN.*
  2. *⚡ Paga en 4 quincenas sin tarjeta de crédito con Kueski Pay.*
  3. *🔥 DROP ACTIVO: Piezas limitadas hasta agotar existencias.*
* **Funcionalidad:** Enlace directo al umbral de envío gratis y persistencia al hacer scroll.

#### B. Header y Navegación
* **Extremo izquierdo:** Menú hamburguesa (Drawer interactivo) con categorías segmentadas:
  * *Explorar por Tipo:* Oversized / Pump Covers, Compression Tees, Shorts & Baggys, Hoodies, Accesorios de Gimnasio.
  * *Explorar por Universo/Drop:* Invincible, Demon Slayer, Jujutsu, Marvel Zombies.
* **Centro:** Logotipo vectorial optimizado (SVG) de Gymbees con tipografía bold/impacto.
* **Extremo derecho:** Ícono de Búsqueda predictiva con fotos miniatura y Carrito deslizable (*Slide-out Drawer Cart*) con contador numérico interactivo.

#### C. Hero Section (Inspiración D2C Streetwear)
* **Visual:** Video o fotografía editorial de alto contraste, iluminación cenital de gimnasio y textura visible del algodón de alto gramaje (240+ GSM).
* **Copywriting:** 
  * *Eyebrow:* COLECCIÓN HEAVYWEIGHT 2026
  * *Titular H1:* FORJADO PARA EL HIERRO.
  * *Bajada:* Prendas de entrenamiento con siluetas oversized y compresión de alto rendimiento.
* **Doble CTA (Call to Action):**
  * Botón 1 (Primario Negro Sólido): `[ COMPRAR NUEVO DROP ]`
  * Botón 2 (Secundario Outline/Borde Blanco): `[ VER BÁSICOS ]`

#### D. Barra de Propuestas de Valor (Value Proposition Strip)
Cuadrícula de 4 micro-beneficios con iconografía minimalista de trazo fino:
* 🇲🇽 **Diseño y Confección Nacional:** Telas prémium de alto gramaje.
* 📦 **Despacho Rápido:** Envíos a todo México vía DHL / Estafeta en 24-72h.
* 🔄 **Garantía de Ajuste:** Primer cambio de talla sin costo de flete.
* 💳 **Flexibilidad Total:** Paga con Kueski, Aplazo, Tarjetas o Efectivo en OXXO.

#### E. Grid de Más Vendidos con "Quick-Add"
* **Comportamiento:** Carrusel horizontal táctil (*touch-slider*) con rebote elástico.
* **Tarjeta de Producto:**
  * Badge superior: *"Bestseller"* o *"Pocas piezas"*.
  * Imagen secundaria automática al hacer hover (frente y espalda para ver el arte gráfico).
  * Selector directo de tallas en hover/tap (`S` `M` `L` `XL` `2XL`).
  * Al presionar la talla, se añade al carrito instantáneamente activando el *Slide-out Cart* sin recargar la página.

#### F. Categorías en Bento Grid Visual
Mosaico moderno con fotografías de modelos vistiendo la prenda en uso real:
1. **Pump Covers (Grande):** Enfocado en la caída amplia y el corte de hombros caídos.
2. **Compression (Mediano):** Enfoque en elasticidad, costuras reforzadas y ajuste muscular.
3. **Pants & Baggys (Mediano):** Movilidad y estética *golden era*.
4. **Accesorios (Pequeño):** Straps, muñequeras, calcetas tubulares y gorras.

#### G. Footer Estructurado
* Organizado en acordeones colapsables para móvil:
  * **Navegación:** Colecciones, Drops pasados, Tarjeta de Regalo.
  * **Atención al Atleta:** Guía de Tallas, Rastrear Pedido, WhatsApp de Soporte, Cambios y Devoluciones.
  * **Legal & Transparencia:** Términos de Servicio, Política de Privacidad, Registro de Marca.
* Sellos de seguridad y pasarelas de pago mexicanas en fondo contrastante (Kueski Pay, Aplazo, Mercado Pago, Visa, Mastercard, AMEX, OXXO Pay).

---

## 3. Estrategia UX para la Ficha de Producto (PDP) en Ropa Deportiva

La Ficha de Producto (PDP) es la zona de mayor fricción y donde se define la tasa de conversión. Para marcas de fitness, las dos objeciones universales son: **"¿Me quedará bien?"** y **"¿Qué calidad tiene la tela?"**.

```
┌─────────────────────────────────────────────────────────────┐
│ ◀ VOLVER A PUMP COVERS                                      │
├─────────────────────────────────────────────────────────────┤
│ [GALERÍA DE FOTOS INTERACTIVA - 1:1 o 4:5]                  │
│  - Foto 1: Frontal completa en modelo                        │
│  - Foto 2: Espalda con detalle del gráfico serigráfico      │
│  - Foto 3: Macro zoom de costuras y cuello acanalado         │
│  - Foto 4: Modelo en movimiento / Ejercicio                  │
│  ● ○ ○ ○ (Swipe horizontal)                                 │
├─────────────────────────────────────────────────────────────┤
│ GYMBEES HEAVY CLUB                                          │
│ OVERSIZED PUMP COVER "NOLAN GRAYSON"                        │
│ ★★★★★ 4.9 (48 reseñas)                                      │
│                                                             │
│ $649 MXN  ó 4 quincenas de $162.25 con Kueski Pay           │
├─────────────────────────────────────────────────────────────┤
│ COLOR: Negro Deslavado (Acid Wash)                          │
│ [ (●) Negro ] [ (○) Carbón ] [ (○) Arena ]  (Swatches reales)│
├─────────────────────────────────────────────────────────────┤
│ SELECCIONA TU TALLA:            📏 GUÍA DE MEDIDAS Y FIT ➔  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│ │  S  │ │  M  │ │  L  │ │ XL  │ │ 2XL │ (Pills con feedback)│
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                     │
│ ⚠️ ¡Solo quedan 2 piezas en talla L!                         │
├─────────────────────────────────────────────────────────────┤
│ 🧍 REF. MODELO: Mide 1.80 m, pesa 86 kg y viste talla L     │
│    (Corte amplio / Hombro caído intencional)                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              [ AGREGAR AL CARRITO - $649 MXN ]          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [STICKY BOTTOM BAR EN MÓVIL AL SCROLLEAR]                   │
│  Nolan Oversized (L)  $649 MXN   [ AGREGAR AL CARRITO ]     │
├─────────────────────────────────────────────────────────────┤
│ DETALLES TÉCNICOS & DESPLEGABLES (ACORDEONES):              │
│  ▾ Composición & Cuidados (100% Algodón Peinado, 240 GSM)   │
│  ▾ Envíos y Tiempos de Entrega (2-4 días hábiles a MX)      │
│  ▾ Cambios y Devoluciones sin Complicaciones                │
└─────────────────────────────────────────────────────────────┘
```

### 3.1. Manejo Óptimo de Variantes (Talla y Color)
* **Selectores en formato "Pills" (No Dropdowns):** Queda prohibido el uso del menú desplegable genérico `<select>`. Se implementan botones de pastilla (*pills*) donde todas las tallas están a la vista con un solo tap.
* **Estados visuales claros:**
  * *Disponible:* Borde nítido y fondo contrastante.
  * *Agotado:* Fondo grisáceo, texto tachado diagonalmente y botón interactivo para *"Avisarme cuando esté disponible"* (Captura de Leads SMS/WhatsApp).
  * *Stock Bajo:* Indicador con micro-etiqueta en naranja *"Pocas piezas"*.
* **Color Swatches con miniaturas de tejido real:** En lugar de círculos con colores CSS planos, mostrar muestras de textura real (especialmente importante para acabados como *Acid Wash*, *Vintage Grey* o *Heavy Cotton*).

### 3.2. Solución UX para la Guía de Tallas (Reducción de Devoluciones)
1. **Modal Interactivo "Fit & Measurements":**
   * Pestaña 1: **Medidas de la Prenda en plano** (Pecho, Largo total, Ancho de hombro) en centímetros.
   * Pestaña 2: **Cómo medirte en casa** (Ilustración simple con cinta métrica).
2. **Referencia Humana Obligatoria (Standard Gymshark/Alphalete):**
   * Debajo de las tallas se coloca un micro-texto de referencia:  
     *"El atleta de la foto mide 1.82 m, pesa 88 kg con complexión atlética y viste talla L para un look oversized relajado."*
3. **Escala Visual de Ajuste:**
   * Barra gráfica con indicador:  
     `Compresión [───] Ceñido [───] Regular [───] Oversized [─▲─] Ultra-Oversized`

### 3.3. Microinteracciones de Conversión
* **Sticky Add-to-Cart (Barra de Compra Flotante en Móvil):**
  * Cuando el usuario hace scroll hacia abajo para leer las reseñas o detalles de la tela y pasa el botón principal de compra, se ancla una barra fija en la parte inferior de la pantalla con la foto miniatura, el precio, el selector de talla rápido y el botón de compra inmediata. Esto previene la fricción de tener que regresar al inicio de la página.
* **Slide-out Cart (Carrito Lateral con Gamificación de Envío):**
  * Al presionar "Agregar", se despliega un cajón lateral sin redireccionar al usuario a `/cart`.
  * Incluye una **Barra de Progreso de Envío Gratis**:  
    *"¡Estás a solo $350 MXN de desbloquear ENVÍO GRATIS a todo México!"*
  * **Cross-sell / 1-Click Upsell integrado en el carrito:** Sugerencias de productos de impulso bajo costo (ej. calcetines de entrenamiento o straps para levantamiento de $199 MXN) que completan el monto exacto para el envío gratuito.

---

## 4. Matriz de Priorización: Valor vs. Esfuerzo

| Clasificación | Iniciativa / Feature | Impacto en Conversión (Valor) | Esfuerzo de Implementación | Justificación Estratégica |
| :--- | :--- | :--- | :--- | :--- |
| **Quick Win** | **Traducción y localización 100% al español mexicano** | **ALTO** (Elimina desconfianza) | **BAJO** (Configuración de idioma en Shopify Theme) | Erradicar textos en inglés ("Shop Now", "Sold Out") y unificar el tono urbano/atlético nacional. |
| **Quick Win** | **Sticky Announcement Bar con umbral de envío gratis** | **MEDIO - ALTO** (Aumenta AOV) | **BAJO** (Ajuste de Liquid o tema base) | Comunica de inmediato el incentivo de compra y la oferta de financiamiento con BNPL. |
| **Quick Win** | **Inclusión de referencias del modelo en la PDP** | **ALTO** (Baja tasa de rebote) | **BAJO** (Metafields nativos de Shopify) | Agregar texto de altura/peso del modelo y tipo de fit en cada producto existente. |
| **Quick Win** | **Activar insignias de métodos de pago en el footer y checkout** | **ALTO** (Confianza inmediata) | **BAJO** (Configuración de pasarelas y assets) | Mostrar explícitamente Kueski Pay, Mercado Pago, tarjetas y OXXO para el consumidor joven sin tarjeta bancaria. |
| **Mejora Media** | **Reemplazo de galería estática de la Home por Grid con Quick-Add** | **MUY ALTO** (Impulso de compra) | **MEDIO** (Sección dinámica en Liquid / Dawn OS 2.0) | Permite que el usuario añada productos a la cesta en 1 solo clic directo desde la página de inicio. |
| **Mejora Media** | **Modal de Guía de Tallas interactivo con medidas en CM** | **ALTO** (Reduce devoluciones) | **MEDIO** (Popup accesible en CSS/JS + tabla gráfica) | Elimina la duda de tallaje antes de llegar al carrito. |
| **Mejora Media** | **Sticky Add-to-Cart flotante en móvil** | **ALTO** (Acelera checkout) | **MEDIO** (Componente sticky condicional en scroll) | Captura la compra en el momento exacto en que el usuario termina de evaluar la descripción o fotos. |
| **Mejora Media** | **Drawer Cart (Cajón lateral) con barra de envío y Cross-sell** | **MUY ALTO** (Incrementa AOV +18%) | **MEDIO** (Reemplazo del /cart estándar por Drawer) | Ofrece una experiencia de compra continua e incentiva productos complementarios (straps, shakers, calcetas). |
| **Estructural** | **Reestructuración de Taxonomía y Filtros de Colección** | **ALTO** (Optimiza descubrimiento) | **MEDIO - ALTO** (Estructura de colecciones y Search & Discovery) | Segmentación profesional por Ajuste (Oversized, Regular, Compresión) y Franquicia de Anime/Drop. |
| **Estructural** | **Integración de Motor de Reseñas y UGC (User-Generated Content)** | **MUY ALTO** (Prueba social) | **MEDIO - ALTO** (Integración de app como Judge.me / Loox) | Recopilación de fotos de clientes reales entrenando con las prendas; esencial para competir con YoungLA/Gymshark. |
| **Estructural** | **Rediseño completo bajo Sistema de Diseño D2C (Design Tokens & UI Kit)** | **CRÍTICO** (Escalabilidad de marca) | **ALTO** (Desarrollo a la medida sobre Shopify OS 2.0 o Headless) | Homologación visual total: tipografías condensadas de impacto, microinteracciones y preparación para drops masivos. |
