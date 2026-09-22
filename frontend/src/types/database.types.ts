export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EstadoFlujoEnum =
  | '1_NUEVO_REQUERIMIENTO'
  | '2_ESPERANDO_INFO_LOCAL'
  | '3_LEVANTAMIENTO_COMPLETO'
  | '4_EN_LICITACION'
  | '5_EVALUANDO_COTIZACIONES'
  | '6_COTIZACION_APROBADA'
  | '7_OBRA_VALIDADA'
  | 'CERRADO';

export type RolUsuarioEnum =
  | 'admin'
  | 'comercial'
  | 'ingeniero'
  | 'gerente_tienda'
  | 'proveedor'
  | 'supervisor'
  | 'finanzas';

export type PrioridadSolicitudEnum = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface Database {
  public: {
    Tables: {
      locales: {
        Row: {
          id: string;
          nombre: string;
          codigo: string;
          direccion: string | null;
          centro_comercial: string | null;
          area_m2: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          codigo: string;
          direccion?: string | null;
          centro_comercial?: string | null;
          area_m2?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          codigo?: string;
          direccion?: string | null;
          centro_comercial?: string | null;
          area_m2?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contratistas: {
        Row: {
          id: string;
          nombre_empresa: string;
          ruc_identificacion: string;
          especialidad: string | null;
          contacto_nombre: string | null;
          correo: string | null;
          telefono: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre_empresa: string;
          ruc_identificacion: string;
          especialidad?: string | null;
          contacto_nombre?: string | null;
          correo?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre_empresa?: string;
          ruc_identificacion?: string;
          especialidad?: string | null;
          contacto_nombre?: string | null;
          correo?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      perfiles_usuario: {
        Row: {
          id: string;
          auth_id: string;
          nombre_completo: string;
          correo: string;
          rol: RolUsuarioEnum;
          local_id: string | null;
          contratista_id: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          nombre_completo: string;
          correo: string;
          rol: RolUsuarioEnum;
          local_id?: string | null;
          contratista_id?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          nombre_completo?: string;
          correo?: string;
          rol?: RolUsuarioEnum;
          local_id?: string | null;
          contratista_id?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "perfiles_usuario_local_id_fkey";
            columns: ["local_id"];
            referencedRelation: "locales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "perfiles_usuario_contratista_id_fkey";
            columns: ["contratista_id"];
            referencedRelation: "contratistas";
            referencedColumns: ["id"];
          }
        ];
      };
      solicitudes: {
        Row: {
          id: string;
          codigo: string;
          titulo: string;
          descripcion: string | null;
          local_id: string;
          contratista_id: string | null;
          solicitante_id: string;
          creado_por: string | null;
          prioridad: PrioridadSolicitudEnum;
          fecha_limite: string | null;
          presupuesto: number | null;
          estado_flujo: EstadoFlujoEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          codigo?: string;
          titulo: string;
          descripcion?: string | null;
          local_id: string;
          contratista_id?: string | null;
          solicitante_id: string;
          creado_por?: string | null;
          prioridad?: PrioridadSolicitudEnum;
          fecha_limite?: string | null;
          presupuesto?: number | null;
          estado_flujo?: EstadoFlujoEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          titulo?: string;
          descripcion?: string | null;
          local_id?: string;
          contratista_id?: string | null;
          solicitante_id?: string;
          creado_por?: string | null;
          prioridad?: PrioridadSolicitudEnum;
          fecha_limite?: string | null;
          presupuesto?: number | null;
          estado_flujo?: EstadoFlujoEnum;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "solicitudes_local_id_fkey";
            columns: ["local_id"];
            referencedRelation: "locales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solicitudes_contratista_id_fkey";
            columns: ["contratista_id"];
            referencedRelation: "contratistas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solicitudes_solicitante_id_fkey";
            columns: ["solicitante_id"];
            referencedRelation: "perfiles_usuario";
            referencedColumns: ["id"];
          }
        ];
      };
      especificaciones_tecnicas: {
        Row: {
          id: string;
          solicitud_id: string;
          medidas_exactas_m2: number;
          potencia_electrica_kw: number;
          agua_contraincendio_psi: number;
          tipo_local: string;
          planos_url: string | null;
          fotos_entorno_urls: string[];
          otros_requerimientos: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solicitud_id: string;
          medidas_exactas_m2: number;
          potencia_electrica_kw: number;
          agua_contraincendio_psi: number;
          tipo_local: string;
          planos_url?: string | null;
          fotos_entorno_urls?: string[];
          otros_requerimientos?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solicitud_id?: string;
          medidas_exactas_m2?: number;
          potencia_electrica_kw?: number;
          agua_contraincendio_psi?: number;
          tipo_local?: string;
          planos_url?: string | null;
          fotos_entorno_urls?: string[];
          otros_requerimientos?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "especificaciones_tecnicas_solicitud_id_fkey";
            columns: ["solicitud_id"];
            referencedRelation: "solicitudes";
            referencedColumns: ["id"];
          }
        ];
      };
      formatos_especialista: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          tipo_formato: string;
          archivo_url: string;
          contenido_estructurado: Json;
          embedding_vector: string | number[] | null;
          metadata: Json;
          creado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          tipo_formato: string;
          archivo_url: string;
          contenido_estructurado?: Json;
          embedding_vector?: string | number[] | null;
          metadata?: Json;
          creado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          tipo_formato?: string;
          archivo_url?: string;
          contenido_estructurado?: Json;
          embedding_vector?: string | number[] | null;
          metadata?: Json;
          creado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      storage_validaciones: {
        Row: {
          id: string;
          bucket_name: string;
          mime_permitido: string;
          max_mb: number;
          descripcion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bucket_name: string;
          mime_permitido: string;
          max_mb: number;
          descripcion?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bucket_name?: string;
          mime_permitido?: string;
          max_mb?: number;
          descripcion?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      precios_referencia: {
        Row: {
          id: string;
          categoria: string | null;
          item: string;
          precio_promedio: number;
          precio_minimo: number | null;
          precio_maximo: number | null;
          muestras: number;
          embedding_vector: string | number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          categoria?: string | null;
          item: string;
          precio_promedio: number;
          precio_minimo?: number | null;
          precio_maximo?: number | null;
          muestras?: number;
          embedding_vector?: string | number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          categoria?: string | null;
          item?: string;
          precio_promedio?: number;
          precio_minimo?: number | null;
          precio_maximo?: number | null;
          muestras?: number;
          embedding_vector?: string | number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cotizaciones: {
        Row: {
          id: string;
          solicitud_id: string;
          contratista_id: string | null;
          archivo_url: string | null;
          texto_extraido: string | null;
          categoria_detectada: string | null;
          items: Json;
          monto_total: number | null;
          monto_referencia: number | null;
          desviacion_pct: number | null;
          alerta_sobrecosto: boolean;
          confianza_ia: number | null;
          estado_procesamiento: 'Pendiente' | 'Procesando' | 'Completado' | 'Error';
          resultado_validacion: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solicitud_id: string;
          contratista_id?: string | null;
          archivo_url?: string | null;
          texto_extraido?: string | null;
          categoria_detectada?: string | null;
          items?: Json;
          monto_total?: number | null;
          monto_referencia?: number | null;
          desviacion_pct?: number | null;
          alerta_sobrecosto?: boolean;
          confianza_ia?: number | null;
          estado_procesamiento?: 'Pendiente' | 'Procesando' | 'Completado' | 'Error';
          resultado_validacion?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solicitud_id?: string;
          contratista_id?: string | null;
          archivo_url?: string | null;
          texto_extraido?: string | null;
          categoria_detectada?: string | null;
          items?: Json;
          monto_total?: number | null;
          monto_referencia?: number | null;
          desviacion_pct?: number | null;
          alerta_sobrecosto?: boolean;
          confianza_ia?: number | null;
          estado_procesamiento?: 'Pendiente' | 'Procesando' | 'Completado' | 'Error';
          resultado_validacion?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cotizaciones_solicitud_id_fkey";
            columns: ["solicitud_id"];
            referencedRelation: "solicitudes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cotizaciones_contratista_id_fkey";
            columns: ["contratista_id"];
            referencedRelation: "contratistas";
            referencedColumns: ["id"];
          }
        ];
      };
      informes_obra: {
        Row: {
          id: string;
          solicitud_id: string;
          contratista_id: string | null;
          archivo_informe_url: string | null;
          galeria_fotos_urls: string[];
          resumen_ejecutivo: string | null;
          score_cumplimiento_ia: number | null;
          analisis_multimodal: Json;
          dictamen_ingeniero: 'Aprobado' | 'Observado' | 'Pendiente' | null;
          observaciones_ingeniero: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solicitud_id: string;
          contratista_id?: string | null;
          archivo_informe_url?: string | null;
          galeria_fotos_urls?: string[];
          resumen_ejecutivo?: string | null;
          score_cumplimiento_ia?: number | null;
          analisis_multimodal?: Json;
          dictamen_ingeniero?: 'Aprobado' | 'Observado' | 'Pendiente' | null;
          observaciones_ingeniero?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solicitud_id?: string;
          contratista_id?: string | null;
          archivo_informe_url?: string | null;
          galeria_fotos_urls?: string[];
          resumen_ejecutivo?: string | null;
          score_cumplimiento_ia?: number | null;
          analisis_multimodal?: Json;
          dictamen_ingeniero?: 'Aprobado' | 'Observado' | 'Pendiente' | null;
          observaciones_ingeniero?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "informes_obra_solicitud_id_fkey";
            columns: ["solicitud_id"];
            referencedRelation: "solicitudes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "informes_obra_contratista_id_fkey";
            columns: ["contratista_id"];
            referencedRelation: "contratistas";
            referencedColumns: ["id"];
          }
        ];
      };
      transiciones_estado: {
        Row: {
          id: number;
          estado_origen: EstadoFlujoEnum;
          estado_destino: EstadoFlujoEnum;
          rol_permitido: RolUsuarioEnum[];
          condicion: string | null;
        };
        Insert: {
          id?: number;
          estado_origen: EstadoFlujoEnum;
          estado_destino: EstadoFlujoEnum;
          rol_permitido?: RolUsuarioEnum[];
          condicion?: string | null;
        };
        Update: {
          id?: number;
          estado_origen?: EstadoFlujoEnum;
          estado_destino?: EstadoFlujoEnum;
          rol_permitido?: RolUsuarioEnum[];
          condicion?: string | null;
        };
        Relationships: [];
      };
      auditoria: {
        Row: {
          id: number;
          solicitud_id: string | null;
          usuario_id: string | null;
          accion: string;
          detalle: Json;
          creado_en: string;
        };
        Insert: {
          id?: number;
          solicitud_id?: string | null;
          usuario_id?: string | null;
          accion: string;
          detalle?: Json;
          creado_en?: string;
        };
        Update: {
          id?: number;
          solicitud_id?: string | null;
          usuario_id?: string | null;
          accion?: string;
          detalle?: Json;
          creado_en?: string;
        };
        Relationships: [];
      };
      alertas_enviadas: {
        Row: {
          id: number;
          solicitud_id: string;
          tipo_alerta: string;
          destinatario: string;
          enviado_en: string;
        };
        Insert: {
          id?: number;
          solicitud_id: string;
          tipo_alerta: string;
          destinatario: string;
          enviado_en?: string;
        };
        Update: {
          id?: number;
          solicitud_id?: string;
          tipo_alerta?: string;
          destinatario?: string;
          enviado_en?: string;
        };
        Relationships: [];
      };
      erp_sincronizacion: {
        Row: {
          id: string;
          solicitud_id: string;
          erp_documento_id: string | null;
          estado_pago: string | null;
          monto_sincronizado: number | null;
          direccion: 'Salida' | 'Entrada' | null;
          payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solicitud_id: string;
          erp_documento_id?: string | null;
          estado_pago?: string | null;
          monto_sincronizado?: number | null;
          direccion?: 'Salida' | 'Entrada' | null;
          payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solicitud_id?: string;
          erp_documento_id?: string | null;
          estado_pago?: string | null;
          monto_sincronizado?: number | null;
          direccion?: 'Salida' | 'Entrada' | null;
          payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "erp_sincronizacion_solicitud_id_fkey";
            columns: ["solicitud_id"];
            referencedRelation: "solicitudes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      mv_tiempos_promedio_estado: {
        Row: {
          estado_flujo: EstadoFlujoEnum;
          tiempo_promedio_segundos: number | null;
        };
      };
      mv_desviaciones_cotizaciones: {
        Row: {
          local_id: string;
          desviacion_promedio: number | null;
          total_cotizaciones: number;
        };
      };
      mv_volumen_por_tienda: {
        Row: {
          local_id: string;
          local_nombre: string;
          total_solicitudes: number;
          solicitudes_activas: number;
          solicitudes_cerradas: number;
        };
      };
      mv_eficiencia_contratistas: {
        Row: {
          contratista_id: string;
          nombre_empresa: string;
          obras_completadas: number;
          dias_promedio_ejecucion: number | null;
          score_calidad_promedio: number | null;
        };
      };
      mv_kpis_generales: {
        Row: {
          total_solicitudes_mes: number;
          variacion_mes_anterior_pct: number;
          tiempo_promedio_cierre_dias: number;
          salud_presupuestal_pct: number;
          alertas_sla_activas: number;
        };
      };
    };
    Functions: {
      fn_refresh_bi_views: {
        Args: Record<string, never>;
        Returns: void;
      };
      match_formatos_especialista: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          tipo_formato: string;
          titulo: string;
          contenido_plantilla: string;
          similarity: number;
        }[];
      };
      match_precios_referencia: {
        Args: {
          query_embedding: string;
          p_categoria: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          rubro: string;
          descripcion: string;
          unidad: string;
          precio_unitario_referencial: number;
          similarity: number;
        }[];
      };
      current_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: RolUsuarioEnum;
      };
      es_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      es_ingeniero: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      es_supervisor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      es_comercial: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      es_gerente: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      es_proveedor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      estado_flujo_enum: EstadoFlujoEnum;
      rol_usuario_enum: RolUsuarioEnum;
    };
  };
}
