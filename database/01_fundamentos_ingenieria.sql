-- =============================================================================
-- DDL COMPLETO - CRM INGENIERÍA Y LOCALES COMERCIALES (PRODUCCIÓN)
-- PostgreSQL (Supabase) - Incluye pgvector, State Machine, RLS, Auditoría, BI
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONES
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 2. ENUMERADOS
-- ---------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_flujo_enum') THEN
        CREATE TYPE public.estado_flujo_enum AS ENUM (
            '1_NUEVO_REQUERIMIENTO',
            '2_ESPERANDO_INFO_LOCAL',
            '3_LEVANTAMIENTO_COMPLETO',
            '4_EN_LICITACION',
            '5_EVALUANDO_COTIZACIONES',
            '6_COTIZACION_APROBADA',
            '7_OBRA_VALIDADA',
            'CERRADO'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario_enum') THEN
        CREATE TYPE public.rol_usuario_enum AS ENUM (
            'admin',
            'comercial',
            'ingeniero',
            'gerente_tienda',
            'proveedor',
            'supervisor',
            'finanzas'
        );
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. SECUENCIAS
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_solicitud_codigo START 1;

-- ---------------------------------------------------------------------------
-- 4. FUNCIONES AUXILIARES Y RBAC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 5. TABLAS MAESTRAS Y ENTIDADES NÚCLEO
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    direccion TEXT,
    centro_comercial VARCHAR(255),
    area_m2 NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contratistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_empresa VARCHAR(255) NOT NULL,
    ruc_identificacion VARCHAR(50) UNIQUE NOT NULL,
    especialidad VARCHAR(100),
    contacto_nombre VARCHAR(255),
    correo VARCHAR(255),
    telefono VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.perfiles_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    rol public.rol_usuario_enum NOT NULL DEFAULT 'comercial',
    local_id UUID REFERENCES public.locales(id) ON DELETE SET NULL,
    contratista_id UUID REFERENCES public.contratistas(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---------------------------------------------------------------------------
-- 6. TABLA DE SOLICITUDES Y ESPECIFICACIONES TÉCNICAS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL DEFAULT ('SOL-' || LPAD(nextval('public.seq_solicitud_codigo')::text, 6, '0')),
    local_id UUID NOT NULL REFERENCES public.locales(id) ON DELETE CASCADE,
    comercial_id UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
    ingeniero_id UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    presupuesto_estimado NUMERIC(12,2),
    estado_flujo public.estado_flujo_enum NOT NULL DEFAULT '1_NUEVO_REQUERIMIENTO',
    prioridad VARCHAR(20) DEFAULT 'media',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.especificaciones_tecnicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID UNIQUE NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    medidas_exactas_m2 NUMERIC(10,2),
    potencia_electrica_kw NUMERIC(10,2),
    agua_contraincendio_psi NUMERIC(10,2),
    tipo_local VARCHAR(100),
    planos_url TEXT,
    observaciones_tecnicas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.formatos_especialista (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_formato VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    archivo_url TEXT,
    embedding_vector vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.precios_referencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    precio_promedio NUMERIC(10,2) NOT NULL,
    embedding_vector vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    contratista_id UUID NOT NULL REFERENCES public.contratistas(id) ON DELETE CASCADE,
    archivo_url TEXT,
    monto_total NUMERIC(12,2),
    estado_procesamiento VARCHAR(50) DEFAULT 'Pendiente',
    texto_extraido TEXT,
    resultado_validacion JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---------------------------------------------------------------------------
-- 7. MÁQUINA DE ESTADOS (TRIGGERS DE VALIDACIÓN)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validar_transicion_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado_flujo = NEW.estado_flujo THEN
        RETURN NEW;
    END IF;

    IF OLD.estado_flujo = '1_NUEVO_REQUERIMIENTO' AND NEW.estado_flujo NOT IN ('2_ESPERANDO_INFO_LOCAL') THEN
        RAISE EXCEPTION 'Transición inválida: de 1_NUEVO_REQUERIMIENTO solo se puede pasar a 2_ESPERANDO_INFO_LOCAL';
    ELSIF OLD.estado_flujo = '2_ESPERANDO_INFO_LOCAL' AND NEW.estado_flujo NOT IN ('3_LEVANTAMIENTO_COMPLETO') THEN
        RAISE EXCEPTION 'Transición inválida: de 2_ESPERANDO_INFO_LOCAL solo se puede pasar a 3_LEVANTAMIENTO_COMPLETO';
    ELSIF OLD.estado_flujo = '3_LEVANTAMIENTO_COMPLETO' AND NEW.estado_flujo NOT IN ('4_EN_LICITACION') THEN
        RAISE EXCEPTION 'Transición inválida: de 3_LEVANTAMIENTO_COMPLETO solo se puede pasar a 4_EN_LICITACION';
    ELSIF OLD.estado_flujo = '4_EN_LICITACION' AND NEW.estado_flujo NOT IN ('5_EVALUANDO_COTIZACIONES') THEN
        RAISE EXCEPTION 'Transición inválida: de 4_EN_LICITACION solo se puede pasar a 5_EVALUANDO_COTIZACIONES';
    ELSIF OLD.estado_flujo = '5_EVALUANDO_COTIZACIONES' AND NEW.estado_flujo NOT IN ('6_COTIZACION_APROBADA') THEN
        RAISE EXCEPTION 'Transición inválida: de 5_EVALUANDO_COTIZACIONES solo se puede pasar a 6_COTIZACION_APROBADA';
    ELSIF OLD.estado_flujo = '6_COTIZACION_APROBADA' AND NEW.estado_flujo NOT IN ('7_OBRA_VALIDADA') THEN
        RAISE EXCEPTION 'Transición inválida: de 6_COTIZACION_APROBADA solo se puede pasar a 7_OBRA_VALIDADA';
    ELSIF OLD.estado_flujo = '7_OBRA_VALIDADA' AND NEW.estado_flujo NOT IN ('CERRADO') THEN
        RAISE EXCEPTION 'Transición inválida: de 7_OBRA_VALIDADA solo se puede pasar a CERRADO';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_transicion_estado
BEFORE UPDATE OF estado_flujo ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.fn_validar_transicion_estado();

-- ---------------------------------------------------------------------------
-- 8. VISTAS MATERIALIZADAS PARA DASHBOARD ANALÍTICO BI
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_kpi AS
SELECT 
    s.estado_flujo,
    COUNT(s.id) AS total_solicitudes,
    COALESCE(SUM(s.presupuesto_estimado), 0) AS presupuesto_total,
    COALESCE(AVG(s.presupuesto_estimado), 0) AS presupuesto_promedio
FROM public.solicitudes s
GROUP BY s.estado_flujo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_kpi_estado ON public.mv_dashboard_kpi(estado_flujo);
