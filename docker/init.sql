-- ==============================================================================
-- GYMBEES D2C E-COMMERCE: ESQUEMA DE BASE DE DATOS INICIAL
-- Motor: PostgreSQL 16 (Compatible al 100% con Supabase Cloud)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: PRODUCTOS BASE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    material_gsm TEXT, -- Ej: '240 GSM Algodón Peinado'
    fit_type TEXT CHECK (fit_type IN ('oversized', 'compression', 'regular', 'athletic')),
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price > 0),
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: VARIANTES DE PRODUCTO (SKUs ÚNICOS)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', '2XL', 'OS')),
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    price_override DECIMAL(10, 2) CHECK (price_override > 0),
    compare_at_price DECIMAL(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_size_color UNIQUE (product_id, size, color_name)
);

-- 4. TABLA: INVENTARIO POR VARIANTE
CREATE TABLE IF NOT EXISTS public.inventory (
    variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 3,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    default_shipping_address JSONB,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: ÓRDENES DE COMPRA
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
    payment_provider TEXT CHECK (payment_provider IN ('mercadopago', 'stripe', 'kueski')),
    payment_intent_id TEXT UNIQUE,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    shipping_address JSONB NOT NULL,
    tracking_carrier TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA: DETALLES DE LA ORDEN (ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_info TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL
);

-- 8. TABLA: REGISTRO DE EVENTOS DE PAGO (IDEMPOTENCIA DE WEBHOOKS)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON public.inventory(variant_id);

-- ==============================================================================
-- FUNCIÓN TRANSACCIONAL: RESERVA ATÓMICA DE STOCK (PREVENCIÓN DE RACE CONDITIONS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reserve_stock_for_checkout(
    p_variant_id UUID,
    p_quantity INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_available INT;
BEGIN
    SELECT (stock_quantity - reserved_quantity) INTO v_available
    FROM public.inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF v_available >= p_quantity THEN
        UPDATE public.inventory
        SET reserved_quantity = reserved_quantity + p_quantity,
            updated_at = now()
        WHERE variant_id = p_variant_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- SEED DATA: CATÁLOGO INICIAL GYMBEES (DROPS & BÁSICOS)
-- ==============================================================================

-- Categorías
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Pump Covers (Oversized)', 'pump-covers', 'Playeras pesadas de 240+ GSM con corte de hombro caído', 1),
('c2222222-2222-2222-2222-222222222222', 'Compression Wear', 'compresion', 'Playeras de compresión de alta elasticidad muscular', 2),
('c3333333-3333-3333-3333-333333333333', 'Bottoms & Baggys', 'bottoms', 'Pants holgados, shorts de entrenamiento y joggers', 3),
('c4444444-4444-4444-4444-444444444444', 'Accesorios de Levantamiento', 'accesorios', 'Straps, muñequeras y calcetas tubulares', 4)
ON CONFLICT (slug) DO NOTHING;

-- Producto 1: Nolan Heavy Pump Cover
INSERT INTO public.products (id, category_id, name, slug, description, material_gsm, fit_type, base_price, images, is_active) VALUES
('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Nolan Grayson Heavy Pump Cover', 'nolan-heavy-pump-cover', 'Playera oversized de alto gramaje inspirada en Nolan Grayson. Confeccionada con algodón peinado premium de 240 GSM con costuras reforzadas en hombro y cuello acanalado anti-deformación.', '240 GSM Algodón Peinado', 'oversized', 649.00, '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- Variantes de Nolan Pump Cover
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_override, compare_at_price, is_active) VALUES
('b1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111111', 'GB-NOLAN-BLK-S', 'S', 'Negro Deslavado', '#111111', 649.00, 799.00, true),
('b1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111111', 'GB-NOLAN-BLK-M', 'M', 'Negro Deslavado', '#111111', 649.00, 799.00, true),
('b1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111111', 'GB-NOLAN-BLK-L', 'L', 'Negro Deslavado', '#111111', 649.00, 799.00, true),
('b1111111-1111-1111-1111-111111111104', 'a1111111-1111-1111-1111-111111111111', 'GB-NOLAN-BLK-XL', 'XL', 'Negro Deslavado', '#111111', 649.00, 799.00, true)
ON CONFLICT (sku) DO NOTHING;

-- Inventario de Nolan Pump Cover
INSERT INTO public.inventory (variant_id, stock_quantity, reserved_quantity, low_stock_threshold) VALUES
('b1111111-1111-1111-1111-111111111101', 15, 0, 3),
('b1111111-1111-1111-1111-111111111102', 25, 0, 5),
('b1111111-1111-1111-1111-111111111103', 4, 0, 5), -- Talla L con stock bajo (badge CRO)
('b1111111-1111-1111-1111-111111111104', 10, 0, 3)
ON CONFLICT (variant_id) DO NOTHING;

-- Producto 2: Akaza Compression Tee
INSERT INTO public.products (id, category_id, name, slug, description, material_gsm, fit_type, base_price, images, is_active) VALUES
('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Akaza Blood Compression Tee', 'akaza-compression-tee', 'Prenda de compresión técnica de alto rendimiento. Tejido elástico en 4 direcciones que optimiza la circulación y el soporte muscular durante series pesadas.', '220 GSM Spandex Blend', 'compression', 599.00, '["https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- Variantes Akaza
INSERT INTO public.product_variants (id, product_id, sku, size, color_name, color_hex, price_override, compare_at_price, is_active) VALUES
('b2222222-2222-2222-2222-222222222201', 'a2222222-2222-2222-2222-222222222222', 'GB-AKAZA-BLK-M', 'M', 'Negro Grafito', '#0D0D0E', 599.00, 699.00, true),
('b2222222-2222-2222-2222-222222222202', 'a2222222-2222-2222-2222-222222222222', 'GB-AKAZA-BLK-L', 'L', 'Negro Grafito', '#0D0D0E', 599.00, 699.00, true)
ON CONFLICT (sku) DO NOTHING;

-- Inventario Akaza
INSERT INTO public.inventory (variant_id, stock_quantity, reserved_quantity, low_stock_threshold) VALUES
('b2222222-2222-2222-2222-222222222201', 20, 0, 4),
('b2222222-2222-2222-2222-222222222202', 2, 0, 3) -- Stock crítico
ON CONFLICT (variant_id) DO NOTHING;
