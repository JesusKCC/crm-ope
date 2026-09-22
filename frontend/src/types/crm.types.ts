import type {
  Database,
  EstadoFlujoEnum,
  RolUsuarioEnum,
  PrioridadSolicitudEnum
} from './database.types';

export type EstadoFlujo = EstadoFlujoEnum;
export type RolUsuario = RolUsuarioEnum;
export type PrioridadSolicitud = PrioridadSolicitudEnum;

// Entidades Maestras
export type LocalComercial = Database['public']['Tables']['locales']['Row'];
export type Contratista = Database['public']['Tables']['contratistas']['Row'];
export type PerfilUsuario = Database['public']['Tables']['perfiles_usuario']['Row'];
export type SolicitudRow = Database['public']['Tables']['solicitudes']['Row'];
export type EspecificacionTecnicaRow = Database['public']['Tables']['especificaciones_tecnicas']['Row'];
export type FormatoEspecialistaRow = Database['public']['Tables']['formatos_especialista']['Row'];
export type StorageValidacionRow = Database['public']['Tables']['storage_validaciones']['Row'];
export type PrecioReferenciaRow = Database['public']['Tables']['precios_referencia']['Row'];
export type CotizacionRow = Database['public']['Tables']['cotizaciones']['Row'];
export type InformeObraRow = Database['public']['Tables']['informes_obra']['Row'];
export type TransicionEstadoRow = Database['public']['Tables']['transiciones_estado']['Row'];
export type AuditoriaRow = Database['public']['Tables']['auditoria']['Row'];
export type ErpSincronizacionRow = Database['public']['Tables']['erp_sincronizacion']['Row'];

// DTOs y Modelos de Dominio
export interface ItemCotizacion {
  rubro?: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  precio_referencial?: number;
  desviacion_pct?: number;
  alerta_anomalia?: boolean;
}

export interface CotizacionConDetalle extends Omit<CotizacionRow, 'items' | 'resultado_validacion'> {
  items: ItemCotizacion[];
  resultado_validacion: {
    motivo_desviacion?: string;
    partidas_criticas?: string[];
    recomendacion_ia?: string;
    score_confianza?: number;
  };
  contratistas?: Contratista | null;
}

export interface HallazgoVision {
  id: string;
  foto_url: string;
  elemento_evaluado: string;
  estado_detectado: 'Conforme' | 'Defecto_Leve' | 'Defecto_Grave' | 'No_Visible';
  confianza_score: number;
  descripcion_ia: string;
  bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  especificacion_requerida?: string;
}

export interface ItemChecklistTecnico {
  id: string;
  item: string;
  categoria: 'Electrico' | 'Sanitario' | 'Estructural' | 'Acabados' | 'Seguridad';
  conforme_ia: boolean;
  evidencia_encontrada?: string;
  dictamen_ingeniero?: 'Aprobado' | 'Rechazado' | 'Pendiente';
  observacion?: string;
}

export interface InformeObraConDetalle extends Omit<InformeObraRow, 'analisis_multimodal'> {
  analisis_multimodal: {
    score_general_cumplimiento: number;
    hallazgos_vision: HallazgoVision[];
    checklist_tecnico: ItemChecklistTecnico[];
    resumen_ia: string;
    riesgos_detectados: string[];
  };
  contratistas?: Contratista | null;
}

export interface SolicitudConRelaciones extends SolicitudRow {
  locales?: LocalComercial | null;
  contratistas?: Contratista | null;
  solicitante?: PerfilUsuario | null;
  especificaciones_tecnicas?: EspecificacionTecnicaRow | null;
  cotizaciones?: CotizacionConDetalle[];
  informes_obra?: InformeObraConDetalle[];
  erp_sincronizacion?: ErpSincronizacionRow[];
}

// Configuración de la Máquina de Estados de 7 Pasos
export interface PasoConfig {
  paso: number;
  codigo: EstadoFlujo;
  nombreCorto: string;
  titulo: string;
  descripcion: string;
  responsablePrincipal: RolUsuario;
  rolesAutorizados: RolUsuario[];
  siguienteEstadoSugerido?: EstadoFlujo;
  colorHex: string;
  bgHex: string;
  entregableRequerido: string;
}

export const PASOS_FLUJO_CONFIG: Record<EstadoFlujo, PasoConfig> = {
  '1_NUEVO_REQUERIMIENTO': {
    paso: 1,
    codigo: '1_NUEVO_REQUERIMIENTO',
    nombreCorto: '1. Requerimiento',
    titulo: 'Nuevo Requerimiento Comercial',
    descripcion: 'Registro de solicitud de adecuación con alcance preliminar y local comercial.',
    responsablePrincipal: 'comercial',
    rolesAutorizados: ['comercial', 'admin', 'ingeniero'],
    siguienteEstadoSugerido: '2_ESPERANDO_INFO_LOCAL',
    colorHex: '#8A8578',
    bgHex: '#EAE6DC',
    entregableRequerido: 'Ticket con local y descripción'
  },
  '2_ESPERANDO_INFO_LOCAL': {
    paso: 2,
    codigo: '2_ESPERANDO_INFO_LOCAL',
    nombreCorto: '2. Info Local',
    titulo: 'Esperando Información Técnica del Local',
    descripcion: 'El Ingeniero envía formatos base y requiere levantamiento en sitio al Gerente de Tienda.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'admin'],
    siguienteEstadoSugerido: '3_LEVANTAMIENTO_COMPLETO',
    colorHex: '#E8A33D',
    bgHex: '#FBF2E3',
    entregableRequerido: 'Formatos especialista adjuntos'
  },
  '3_LEVANTAMIENTO_COMPLETO': {
    paso: 3,
    codigo: '3_LEVANTAMIENTO_COMPLETO',
    nombreCorto: '3. Levantamiento',
    titulo: 'Levantamiento Técnico Completo',
    descripcion: 'El Gerente de Tienda completó medidas, kW, PSI, planos técnicos y fotos de entorno.',
    responsablePrincipal: 'gerente_tienda',
    rolesAutorizados: ['gerente_tienda', 'admin'],
    siguienteEstadoSugerido: '4_EN_LICITACION',
    colorHex: '#2B4C6F',
    bgHex: '#E2EAF1',
    entregableRequerido: 'Especificaciones técnicas + fotos + planos'
  },
  '4_EN_LICITACION': {
    paso: 4,
    codigo: '4_EN_LICITACION',
    nombreCorto: '4. Licitación',
    titulo: 'Licitación Abierta a Proveedores',
    descripcion: 'Convocatoria a contratistas para cotizar según especificaciones y lineamientos.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'admin'],
    siguienteEstadoSugerido: '5_EVALUANDO_COTIZACIONES',
    colorHex: '#2B4C6F',
    bgHex: '#E2EAF1',
    entregableRequerido: 'Pliego de bases disponible'
  },
  '5_EVALUANDO_COTIZACIONES': {
    paso: 5,
    codigo: '5_EVALUANDO_COTIZACIONES',
    nombreCorto: '5. Evaluación IA',
    titulo: 'Evaluación y Auditoría RAG con HITL',
    descripcion: 'El motor de IA analiza PDF, calcula desviaciones y el Ingeniero audita en Consola HITL.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'supervisor', 'admin'],
    siguienteEstadoSugerido: '6_COTIZACION_APROBADA',
    colorHex: '#E8A33D',
    bgHex: '#FBF2E3',
    entregableRequerido: 'Cotizaciones extraídas + evaluación RAG'
  },
  '6_COTIZACION_APROBADA': {
    paso: 6,
    codigo: '6_COTIZACION_APROBADA',
    nombreCorto: '6. Adjudicación ERP',
    titulo: 'Cotización Aprobada y Sincronizada con ERP',
    descripcion: 'Adjudicación final, generación de orden de compra y ejecución de obra por el contratista.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'supervisor', 'admin'],
    siguienteEstadoSugerido: '7_OBRA_VALIDADA',
    colorHex: '#3F7A6E',
    bgHex: '#E9F3F0',
    entregableRequerido: 'Documento ERP emitido + Obra en marcha'
  },
  '7_OBRA_VALIDADA': {
    paso: 7,
    codigo: '7_OBRA_VALIDADA',
    nombreCorto: '7. Validación Obra',
    titulo: 'Validación Multimodal de Fin de Obra',
    descripcion: 'Inspección de informe técnico y fotos con visión por computadora vs especificaciones.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'supervisor', 'admin'],
    siguienteEstadoSugerido: 'CERRADO',
    colorHex: '#3F7A6E',
    bgHex: '#E9F3F0',
    entregableRequerido: 'Informe final + galería fotográfica + score IA'
  },
  'CERRADO': {
    paso: 8,
    codigo: 'CERRADO',
    nombreCorto: 'Cerrado',
    titulo: 'Expediente Concluido y Archivado',
    descripcion: 'Conformidad final firmada, liquidación archivada y registrada en BI.',
    responsablePrincipal: 'ingeniero',
    rolesAutorizados: ['ingeniero', 'supervisor', 'admin'],
    colorHex: '#5B5648',
    bgHex: '#EDEAD0',
    entregableRequerido: 'Acta de recepción final'
  }
};

// Modelos para Gráficos de Inteligencia de Negocios (BI)
export interface MetricaKpiCard {
  id: string;
  etiqueta: string;
  valor: string | number;
  subtexto: string;
  icono: 'TrendingUp' | 'Clock' | 'Wallet' | 'AlertTriangle' | 'CheckCircle2' | 'Building2';
  variacionPositiva?: boolean;
  colorClase: string;
}

export interface VolumenTiendaData {
  tienda: string;
  solicitudes: number;
  activas: number;
  cerradas: number;
}

export interface TiempoEstadoData {
  estado: string;
  diasPromedio: number;
  slaObjetivoDias: number;
}

export interface EficienciaContratistaData {
  contratista: string;
  diasPromedio: number;
  scoreCalidad: number;
  obrasCompletadas: number;
}

export interface DesviacionPresupuestoData {
  name: string;
  value: number;
  color: string;
}

// Filtros y Respuestas
export interface FiltrosOperativos {
  busqueda: string;
  prioridad: string;
  estadoFlujo: string;
  localId: string;
  contratistaId: string;
}

export interface RespuestaValidacionUpload {
  valido: boolean;
  codigoError?: string;
  mensaje?: string;
  bucket?: string;
  rutaArchivo?: string;
}
