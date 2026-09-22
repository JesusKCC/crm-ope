import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  MOCK_SOLICITUDES,
  MOCK_LOCALES,
  MOCK_CONTRATISTAS,
  MOCK_FORMATOS,
  MOCK_BI_VOLUMEN_TIENDA,
  MOCK_BI_TIEMPO_ESTADO,
  MOCK_BI_EFICIENCIA_CONTRATISTAS,
  MOCK_BI_DESVIACION_PRESUPUESTO
} from '../lib/mockData';
import type {
  SolicitudConRelaciones,
  LocalComercial,
  Contratista,
  FormatoEspecialistaRow,
  EstadoFlujo,
  VolumenTiendaData,
  TiempoEstadoData,
  EficienciaContratistaData,
  DesviacionPresupuestoData,
  EspecificacionTecnicaRow,
  CotizacionConDetalle,
  InformeObraConDetalle,
  PrioridadSolicitud
} from '../types/crm.types';
import type { Json } from '../types/database.types';
import { useAuth } from './AuthContext';
import { validarTransicion } from '../utils/stateTransitions';

interface SolicitudesContextType {
  solicitudes: SolicitudConRelaciones[];
  locales: LocalComercial[];
  contratistas: Contratista[];
  formatos: FormatoEspecialistaRow[];
  loading: boolean;
  error: string | null;
  solicitudSeleccionada: SolicitudConRelaciones | null;
  setSolicitudSeleccionada: (s: SolicitudConRelaciones | null) => void;
  crearSolicitud: (params: {
    titulo: string;
    descripcion: string;
    localId: string;
    prioridad: PrioridadSolicitud;
    presupuesto: number;
    fechaLimite: string;
  }) => Promise<{ exito: boolean; mensaje: string; id?: string }>;
  transicionarEstado: (
    solicitudId: string,
    nuevoEstado: EstadoFlujo,
    datosAdicionales?: {
      especificaciones?: Partial<EspecificacionTecnicaRow>;
      cotizacion?: Partial<CotizacionConDetalle>;
      informeObra?: Partial<InformeObraConDetalle>;
      notaAuditoria?: string;
    }
  ) => Promise<{ exito: boolean; mensaje: string }>;
  guardarEspecificacionesTecnicas: (
    solicitudId: string,
    specs: {
      medidas_exactas_m2: number;
      potencia_electrica_kw: number;
      agua_contraincendio_psi: number;
      tipo_local: string;
      planos_url?: string | null;
      fotos_entorno_urls?: string[];
      otros_requerimientos?: Record<string, unknown>;
    }
  ) => Promise<{ exito: boolean; mensaje: string }>;
  subirCotizacionProveedor: (
    solicitudId: string,
    archivo: File,
    datosExtra?: { montoTotal?: number; contratistaId?: string }
  ) => Promise<{ exito: boolean; mensaje: string }>;
  guardarDecisionHITL: (
    solicitudId: string,
    cotizacionId: string,
    decision: 'Aprobar' | 'Rechazar',
    itemsAjustados?: CotizacionConDetalle['items'],
    motivoOverride?: string
  ) => Promise<{ exito: boolean; mensaje: string }>;
  guardarDictamenObra: (
    solicitudId: string,
    informeId: string,
    dictamen: 'Aprobado' | 'Observado',
    observaciones: string
  ) => Promise<{ exito: boolean; mensaje: string }>;
  // BI Analytics
  biVolumenTienda: VolumenTiendaData[];
  biTiempoEstado: TiempoEstadoData[];
  biEficienciaContratistas: EficienciaContratistaData[];
  biDesviacionPresupuesto: DesviacionPresupuestoData[];
  refrescarDatosBI: () => Promise<void>;
  biCargando: boolean;
}

const SolicitudesContext = createContext<SolicitudesContextType | undefined>(undefined);

export const SolicitudesProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { profile, rolActivo } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudConRelaciones[]>(MOCK_SOLICITUDES);
  const [locales, setLocales] = useState<LocalComercial[]>(MOCK_LOCALES);
  const [contratistas, setContratistas] = useState<Contratista[]>(MOCK_CONTRATISTAS);
  const [formatos, setFormatos] = useState<FormatoEspecialistaRow[]>(MOCK_FORMATOS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudConRelaciones | null>(null);

  // BI Data State
  const [biVolumenTienda] = useState<VolumenTiendaData[]>(MOCK_BI_VOLUMEN_TIENDA);
  const [biTiempoEstado, setBiTiempoEstado] = useState<TiempoEstadoData[]>(MOCK_BI_TIEMPO_ESTADO);
  const [biEficienciaContratistas] = useState<EficienciaContratistaData[]>(MOCK_BI_EFICIENCIA_CONTRATISTAS);
  const [biDesviacionPresupuesto] = useState<DesviacionPresupuestoData[]>(MOCK_BI_DESVIACION_PRESUPUESTO);
  const [biCargando, setBiCargando] = useState<boolean>(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setSolicitudes(MOCK_SOLICITUDES);
      setLocales(MOCK_LOCALES);
      setContratistas(MOCK_CONTRATISTAS);
      setFormatos(MOCK_FORMATOS);
      setLoading(false);
      return;
    }

    try {
      const [resSol, resLoc, resCont, resFmt] = await Promise.all([
        supabase.from('solicitudes').select(`
          *,
          locales (*),
          contratistas (*),
          especificaciones_tecnicas (*),
          cotizaciones (*),
          informes_obra (*),
          erp_sincronizacion (*)
        `).order('created_at', { ascending: false }),
        supabase.from('locales').select('*').order('nombre'),
        supabase.from('contratistas').select('*').order('nombre_empresa'),
        supabase.from('formatos_especialista').select('*').order('created_at', { ascending: false }),
      ]);

      if (resSol.data && resSol.data.length > 0) {
        setSolicitudes(resSol.data as unknown as SolicitudConRelaciones[]);
      } else {
        setSolicitudes(MOCK_SOLICITUDES);
      }

      if (resLoc.data && resLoc.data.length > 0) setLocales(resLoc.data);
      if (resCont.data && resCont.data.length > 0) setContratistas(resCont.data);
      if (resFmt.data && resFmt.data.length > 0) setFormatos(resFmt.data as FormatoEspecialistaRow[]);
    } catch (err: unknown) {
      console.warn('Fallo cargando de Supabase, activando mock reactivo:', err);
      setSolicitudes(MOCK_SOLICITUDES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const refrescarDatosBI = async () => {
    setBiCargando(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.rpc('fn_refresh_bi_views');
        
        const { data: mvTiempos } = await supabase.from('mv_tiempos_promedio_estado').select('*');
        if (mvTiempos && mvTiempos.length > 0) {
          setBiTiempoEstado(
            mvTiempos.map((t: { estado_flujo: EstadoFlujo; tiempo_promedio_segundos: number | null }) => ({
              estado: t.estado_flujo.replace(/_/g, ' '),
              diasPromedio: Number(((t.tiempo_promedio_segundos || 0) / 86400).toFixed(1)),
              slaObjetivoDias: 3.0,
            }))
          );
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setBiTiempoEstado([...MOCK_BI_TIEMPO_ESTADO]);
      }
    } catch (err) {
      console.error('Error refreshing BI views:', err);
    } finally {
      setBiCargando(false);
    }
  };

  const crearSolicitud = async (params: {
    titulo: string;
    descripcion: string;
    localId: string;
    prioridad: PrioridadSolicitud;
    presupuesto: number;
    fechaLimite: string;
  }): Promise<{ exito: boolean; mensaje: string; id?: string }> => {
    const local = locales.find((l: LocalComercial) => l.id === params.localId) || locales[0];
    const nuevoCodigo = `SOL-${String(solicitudes.length + 1).padStart(5, '0')}`;
    const idGenerado = `sol-${Date.now()}`;

    const nueva: SolicitudConRelaciones = {
      id: idGenerado,
      codigo: nuevoCodigo,
      titulo: params.titulo,
      descripcion: params.descripcion,
      local_id: params.localId,
      contratista_id: null,
      solicitante_id: profile?.id || 'usr-comercial-001',
      creado_por: profile?.auth_id || null,
      prioridad: params.prioridad,
      fecha_limite: params.fechaLimite,
      presupuesto: params.presupuesto,
      estado_flujo: '1_NUEVO_REQUERIMIENTO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locales: local,
      contratistas: null,
      especificaciones_tecnicas: null,
      cotizaciones: [],
      informes_obra: [],
      erp_sincronizacion: [],
    };

    if (isSupabaseConfigured) {
      const { data, error: dbError } = await (supabase.from('solicitudes') as unknown as {
        insert: (row: Record<string, unknown>) => {
          select: () => {
            single: () => Promise<{ data: { id: string; codigo: string } | null; error: Error | null }>;
          };
        };
      }).insert({
        titulo: params.titulo,
        descripcion: params.descripcion,
        local_id: params.localId,
        solicitante_id: profile?.id || 'usr-comercial-001',
        prioridad: params.prioridad,
        presupuesto: params.presupuesto,
        fecha_limite: params.fechaLimite,
        estado_flujo: '1_NUEVO_REQUERIMIENTO',
      }).select().single();

      if (dbError) {
        return { exito: false, mensaje: `Error de base de datos: ${dbError.message}` };
      }
      if (data) {
        nueva.id = data.id;
        nueva.codigo = data.codigo;
      }
    }

    setSolicitudes((prev: SolicitudConRelaciones[]) => [nueva, ...prev]);
    return { exito: true, mensaje: `Solicitud ${nueva.codigo} creada con éxito en Paso 1.`, id: nueva.id };
  };

  const transicionarEstado = async (
    solicitudId: string,
    nuevoEstado: EstadoFlujo,
    datosAdicionales?: {
      especificaciones?: Partial<EspecificacionTecnicaRow>;
      cotizacion?: Partial<CotizacionConDetalle>;
      informeObra?: Partial<InformeObraConDetalle>;
      notaAuditoria?: string;
    }
  ): Promise<{ exito: boolean; mensaje: string }> => {
    const solicitud = solicitudes.find((s: SolicitudConRelaciones) => s.id === solicitudId);
    if (!solicitud) {
      return { exito: false, mensaje: 'Solicitud no encontrada.' };
    }

    const validacion = validarTransicion(solicitud.estado_flujo, nuevoEstado, rolActivo, solicitud);
    if (!validacion.permitida) {
      return { exito: false, mensaje: validacion.mensajeError || 'Transición denegada por reglas de negocio.' };
    }

    if (isSupabaseConfigured) {
      const { error: dbError } = await (supabase.from('solicitudes') as unknown as {
        update: (row: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: Error | null }>;
        };
      })
        .update({ estado_flujo: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', solicitudId);

      if (dbError) {
        return { exito: false, mensaje: `Error al actualizar estado: ${dbError.message}` };
      }
    }

    setSolicitudes((prev: SolicitudConRelaciones[]) =>
      prev.map((s: SolicitudConRelaciones) => {
        if (s.id !== solicitudId) return s;
        const actualizada: SolicitudConRelaciones = {
          ...s,
          estado_flujo: nuevoEstado,
          updated_at: new Date().toISOString(),
        };

        if (datosAdicionales?.especificaciones) {
          actualizada.especificaciones_tecnicas = {
            id: s.especificaciones_tecnicas?.id || `esp-${Date.now()}`,
            solicitud_id: solicitudId,
            medidas_exactas_m2: datosAdicionales.especificaciones.medidas_exactas_m2 || 100,
            potencia_electrica_kw: datosAdicionales.especificaciones.potencia_electrica_kw || 10,
            agua_contraincendio_psi: datosAdicionales.especificaciones.agua_contraincendio_psi || 50,
            tipo_local: datosAdicionales.especificaciones.tipo_local || 'Comercial',
            planos_url: datosAdicionales.especificaciones.planos_url || null,
            fotos_entorno_urls: datosAdicionales.especificaciones.fotos_entorno_urls || [],
            otros_requerimientos: (datosAdicionales.especificaciones.otros_requerimientos as unknown as Json) || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        return actualizada;
      })
    );

    if (solicitudSeleccionada?.id === solicitudId) {
      setSolicitudSeleccionada((prev: SolicitudConRelaciones | null) => (prev ? { ...prev, estado_flujo: nuevoEstado } : null));
    }

    return { exito: true, mensaje: `Transición a ${nuevoEstado.replace(/_/g, ' ')} ejecutada correctamente.` };
  };

  const guardarEspecificacionesTecnicas = async (
    solicitudId: string,
    specs: {
      medidas_exactas_m2: number;
      potencia_electrica_kw: number;
      agua_contraincendio_psi: number;
      tipo_local: string;
      planos_url?: string | null;
      fotos_entorno_urls?: string[];
      otros_requerimientos?: Record<string, unknown>;
    }
  ): Promise<{ exito: boolean; mensaje: string }> => {
    const solicitud = solicitudes.find((s: SolicitudConRelaciones) => s.id === solicitudId);
    if (!solicitud) return { exito: false, mensaje: 'Solicitud no encontrada.' };

    const specRow: EspecificacionTecnicaRow = {
      id: solicitud.especificaciones_tecnicas?.id || `esp-${Date.now()}`,
      solicitud_id: solicitudId,
      medidas_exactas_m2: specs.medidas_exactas_m2,
      potencia_electrica_kw: specs.potencia_electrica_kw,
      agua_contraincendio_psi: specs.agua_contraincendio_psi,
      tipo_local: specs.tipo_local,
      planos_url: specs.planos_url || null,
      fotos_entorno_urls: specs.fotos_entorno_urls || [],
      otros_requerimientos: (specs.otros_requerimientos as unknown as Json) || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await (supabase.from('especificaciones_tecnicas') as unknown as {
        upsert: (row: Record<string, unknown>) => Promise<{ error: Error | null }>;
      }).upsert(specRow as unknown as Record<string, unknown>);
    }

    setSolicitudes((prev: SolicitudConRelaciones[]) =>
      prev.map((s: SolicitudConRelaciones) => (s.id === solicitudId ? { ...s, especificaciones_tecnicas: specRow } : s))
    );

    await transicionarEstado(solicitudId, '3_LEVANTAMIENTO_COMPLETO');

    return { exito: true, mensaje: 'Especificaciones técnicas registradas y ticket avanzado a Paso 3.' };
  };

  const subirCotizacionProveedor = async (
    solicitudId: string,
    archivo: File,
    datosExtra?: { montoTotal?: number; contratistaId?: string }
  ): Promise<{ exito: boolean; mensaje: string }> => {
    const contratistaAsignado = contratistas.find(
      (c: Contratista) => c.id === (datosExtra?.contratistaId || profile?.contratista_id || 'cont-001')
    );

    const montoTotal = datosExtra?.montoTotal || 48500.0;
    const montoRef = 42000.0;
    const desviacion = ((montoTotal - montoRef) / montoRef) * 100;

    const nuevaCotizacion: CotizacionConDetalle = {
      id: `cot-${Date.now()}`,
      solicitud_id: solicitudId,
      contratista_id: contratistaAsignado?.id || 'cont-001',
      archivo_url: `https://storage.supabase.co/cotizaciones/${archivo.name}`,
      texto_extraido: `Propuesta técnica y económica remitida por ${contratistaAsignado?.nombre_empresa}. Extraído vía OCR/PDF parser.`,
      categoria_detectada: 'Adecuación Integral y Acabados',
      monto_total: montoTotal,
      monto_referencia: montoRef,
      desviacion_pct: parseFloat(desviacion.toFixed(2)),
      alerta_sobrecosto: desviacion > 10.0,
      confianza_ia: 94.5,
      estado_procesamiento: 'Completado',
      resultado_validacion: {
        motivo_desviacion: desviacion > 10 ? `Sobrecosto detectado de +${desviacion.toFixed(1)}% vs precios históricos.` : 'Precios alineados con la base de referencia.',
        partidas_criticas: ['Tabiquería Acústica RF-60'],
        recomendacion_ia: desviacion > 10 ? 'Revisar en Consola HITL para posible ajuste o negociación.' : 'Propuesta económica óptima.',
        score_confianza: 94.5,
      },
      items: [
        {
          rubro: 'Obras Preliminares',
          descripcion: 'Desmontaje y acondicionamiento inicial',
          unidad: 'GLB',
          cantidad: 1,
          precio_unitario: 3500.0,
          precio_total: 3500.0,
          precio_referencial: 3200.0,
          desviacion_pct: 9.38,
          alerta_anomalia: false,
        },
        {
          rubro: 'Tabiquería',
          descripcion: 'Tabiquería Drywall con placa cortafuego RF-60',
          unidad: 'M2',
          cantidad: 180,
          precio_unitario: 145.0,
          precio_total: 26100.0,
          precio_referencial: 112.0,
          desviacion_pct: 29.46,
          alerta_anomalia: true,
        },
        {
          rubro: 'Pisos y Acabados',
          descripcion: 'Porcelanato tráfico pesado 60x60',
          unidad: 'M2',
          cantidad: 120,
          precio_unitario: 95.0,
          precio_total: 11400.0,
          precio_referencial: 90.0,
          desviacion_pct: 5.55,
          alerta_anomalia: false,
        },
        {
          rubro: 'Instalaciones Eléctricas',
          descripcion: 'Luminarias LED comerciales 60x60',
          unidad: 'UND',
          cantidad: 25,
          precio_unitario: 300.0,
          precio_total: 7500.0,
          precio_referencial: 240.0,
          desviacion_pct: 25.0,
          alerta_anomalia: true,
        },
      ],
      contratistas: contratistaAsignado,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSolicitudes((prev: SolicitudConRelaciones[]) =>
      prev.map((s: SolicitudConRelaciones) => {
        if (s.id !== solicitudId) return s;
        return {
          ...s,
          contratista_id: contratistaAsignado?.id || s.contratista_id,
          contratistas: contratistaAsignado || s.contratistas,
          estado_flujo: '5_EVALUANDO_COTIZACIONES',
          cotizaciones: [nuevaCotizacion, ...(s.cotizaciones || [])],
        };
      })
    );

    return { exito: true, mensaje: 'Cotización cargada y procesada con IA. Ticket avanzado a Paso 5 (Evaluación HITL).' };
  };

  const guardarDecisionHITL = async (
    solicitudId: string,
    _cotizacionId: string,
    decision: 'Aprobar' | 'Rechazar',
    itemsAjustados?: CotizacionConDetalle['items'],
    _motivoOverride?: string
  ): Promise<{ exito: boolean; mensaje: string }> => {
    if (decision === 'Aprobar') {
      setSolicitudes((prev: SolicitudConRelaciones[]) =>
        prev.map((s: SolicitudConRelaciones) => {
          if (s.id !== solicitudId) return s;
          const cotActualizadas = (s.cotizaciones || []).map((c: CotizacionConDetalle) => {
            if (itemsAjustados) {
              const nuevoTotal = itemsAjustados.reduce((acc: number, item: { precio_total: number }) => acc + item.precio_total, 0);
              return { ...c, items: itemsAjustados, monto_total: nuevoTotal };
            }
            return c;
          });

          return {
            ...s,
            estado_flujo: '6_COTIZACION_APROBADA',
            cotizaciones: cotActualizadas,
            erp_sincronizacion: [
              {
                id: `erp-${Date.now()}`,
                solicitud_id: solicitudId,
                erp_documento_id: `OC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                estado_pago: 'Emitido_ERP',
                monto_sincronizado: s.cotizaciones?.[0]?.monto_total || s.presupuesto || 0,
                direccion: 'Salida',
                payload: { fecha_adjudicacion: new Date().toISOString(), auditor: profile?.nombre_completo },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          };
        })
      );
      return { exito: true, mensaje: 'Cotización aprobada por Ingeniería. Sincronización ERP y orden de trabajo emitida (Paso 6).' };
    } else {
      setSolicitudes((prev: SolicitudConRelaciones[]) =>
        prev.map((s: SolicitudConRelaciones) => (s.id === solicitudId ? { ...s, estado_flujo: '4_EN_LICITACION' } : s))
      );
      return { exito: true, mensaje: 'Cotización rechazada. Licitación reabierta en Paso 4 para nuevas propuestas.' };
    }
  };

  const guardarDictamenObra = async (
    solicitudId: string,
    _informeId: string,
    dictamen: 'Aprobado' | 'Observado',
    observaciones: string
  ): Promise<{ exito: boolean; mensaje: string }> => {
    if (dictamen === 'Aprobado') {
      setSolicitudes((prev: SolicitudConRelaciones[]) =>
        prev.map((s: SolicitudConRelaciones) => {
          if (s.id !== solicitudId) return s;
          const infs = (s.informes_obra || []).map((inf: InformeObraConDetalle) => ({
            ...inf,
            dictamen_ingeniero: 'Aprobado' as const,
            observaciones_ingeniero: observaciones,
          }));
          return {
            ...s,
            estado_flujo: 'CERRADO',
            informes_obra: infs,
          };
        })
      );
      return { exito: true, mensaje: 'Obra validada con éxito. Expediente cerrado y archivado en histórico.' };
    } else {
      setSolicitudes((prev: SolicitudConRelaciones[]) =>
        prev.map((s: SolicitudConRelaciones) => {
          if (s.id !== solicitudId) return s;
          const infs = (s.informes_obra || []).map((inf: InformeObraConDetalle) => ({
            ...inf,
            dictamen_ingeniero: 'Observado' as const,
            observaciones_ingeniero: observaciones,
          }));
          return {
            ...s,
            estado_flujo: '6_COTIZACION_APROBADA',
            informes_obra: infs,
          };
        })
      );
      return { exito: true, mensaje: 'Observaciones registradas. Se notificó al contratista para subsanar en sitio.' };
    }
  };

  const contextValue = useMemo(
    () => ({
      solicitudes,
      locales,
      contratistas,
      formatos,
      loading,
      error,
      solicitudSeleccionada,
      setSolicitudSeleccionada,
      crearSolicitud,
      transicionarEstado,
      guardarEspecificacionesTecnicas,
      subirCotizacionProveedor,
      guardarDecisionHITL,
      guardarDictamenObra,
      biVolumenTienda,
      biTiempoEstado,
      biEficienciaContratistas,
      biDesviacionPresupuesto,
      refrescarDatosBI,
      biCargando,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solicitudes, locales, contratistas, formatos, loading, error, solicitudSeleccionada, biVolumenTienda, biTiempoEstado, biEficienciaContratistas, biDesviacionPresupuesto, biCargando, rolActivo]
  );

  return <SolicitudesContext.Provider value={contextValue}>{children}</SolicitudesContext.Provider>;
};

export const useSolicitudes = (): SolicitudesContextType => {
  const context = useContext(SolicitudesContext);
  if (!context) {
    throw new Error('useSolicitudes debe ser utilizado dentro de un SolicitudesProvider');
  }
  return context;
};
