-- ==============================================================================
-- MIGRATION: USERS, AUTH & DISCOUNT CODES
-- ==============================================================================

-- 1. TABLA: USUARIOS (AUTENTICACIÓN LOCAL / JWT)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: CÓDIGOS DE DESCUENTO
CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_uses INT, -- NULL = ilimitado
    uses_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ACTUALIZAR ÓRDENES PARA GUARDAR CÓDIGO APLICADO
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- 4. SEMBRAR USUARIOS POR DEFECTO
INSERT INTO public.users (id, email, password_hash, full_name, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@gymbees.mx', '$2b$10$EDnGoR0rnTZxHV.UxCUVTeeysPZH7r5Q5FhRBbp6E3fgFC6S5L8nq', 'Administrador Gymbees', 'admin'),
('u2222222-2222-2222-2222-222222222222', 'atleta@gymbees.mx', '$2b$10$nry9fmVIIiByIC/DESAMDeOpgBmgay3MJppuMPQmKnPJd8Cr8IJa2', 'Atleta Heavyweight', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 5. SEMBRAR CUPONES POR DEFECTO
INSERT INTO public.discount_codes (id, code, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES
('d1111111-1111-1111-1111-111111111111', 'DROP10', 'percentage', 10.00, 500.00, 100, true),
('d2222222-2222-2222-2222-222222222222', 'BEES100', 'fixed', 100.00, 800.00, 50, true)
ON CONFLICT (code) DO NOTHING;
