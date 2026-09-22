import React from 'react';
import type { SolicitudConRelaciones } from '../../types/crm.types';
import { StateBadge } from '../common/StateBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { VisualStepper7Pasos } from '../common/VisualStepper7Pasos';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  X,
  MapPin,
  Clock,
  Wrench,
  DollarSign,
  Maximize2,
  Cpu,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DetalleSolicitudDrawerProps {
  solicitud: SolicitudConRelaciones | null;
  onCerrar: () => void;
  onAbrirTransicion: () => void;
}

export const DetalleSolicitudDrawer: React.FC<DetalleSolicitudDrawerProps> = ({
  solicitud,
  onCerrar,
  onAbrirTransicion,
}) => {
  if (!solicitud) return null;

  const tieneSpecs = Boolean(solicitud.especificaciones_tecnicas);
  const cotizacion = solicitud.cotizaciones?.[0];
  const erp = solicitud.erp_sincronizacion?.[0];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-line shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
      {/* Encabezado del Slide-over */}
      <div className="p-5 border-b border-line bg-card flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-faint font-bold">{solicitud.codigo}</span>
            <PriorityBadge prioridad={solicitud.prioridad} />
          </div>
          <h2 className="font-display font-bold text-lg text-ink leading-tight">
            {solicitud.titulo}
          </h2>
          <div className="text-xs text-faint font-mono mt-1">
            Creado el {formatDate(solicitud.created_at)}
          </div>
        </div>

        <button
          onClick={onCerrar}
          className="text-faint hover:text-ink p-1 rounded hover:bg-lineSoft transition-colors"
          aria-label="Cerrar panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Cuerpo Desplazable */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Stepper Compacto */}
        <VisualStepper7Pasos estadoActual={solicitud.estado_flujo} compacto />

        {/* Estado y Acción de Transición */}
        <div className="p-4 bg-card border border-line rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-faint block mb-1">
              Estado Actual del Ticket
            </span>
            <StateBadge estado={solicitud.estado_flujo} />
          </div>

          <button
            onClick={onAbrirTransicion}
            className="bg-navy hover:bg-[#25394E] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            Avanzar Estado <ArrowRight size={14} />
          </button>
        </div>

        {/* Descripción del Requerimiento */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-faint mb-2">
            Alcance Técnico y Comercial
          </h4>
          <p className="text-xs text-inkSoft leading-relaxed p-3 bg-card border border-lineSoft rounded-sm">
            {solicitud.descripcion || 'Sin descripción detallada.'}
          </p>
        </div>

        {/* Metadata de Ubicación y Contratista */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-card border border-lineSoft rounded-sm">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-faint mb-1">
              <MapPin size={12} className="text-blue" /> Local Comercial
            </span>
            <div className="font-semibold text-ink">{solicitud.locales?.nombre || 'N/A'}</div>
            <div className="text-[10px] text-faint font-mono">{solicitud.locales?.codigo}</div>
          </div>

          <div className="p-3 bg-card border border-lineSoft rounded-sm">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-faint mb-1">
              <Clock size={12} className="text-amber" /> Vencimiento SLA
            </span>
            <div className="font-semibold text-ink">
              {solicitud.fecha_limite ? formatDate(solicitud.fecha_limite) : 'Sin límite'}
            </div>
            <div className="text-[10px] text-faint font-mono">Control de SLA activo</div>
          </div>

          <div className="p-3 bg-card border border-lineSoft rounded-sm">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-faint mb-1">
              <DollarSign size={12} className="text-teal" /> Presupuesto Referencial
            </span>
            <div className="font-mono font-bold text-ink text-sm">
              {formatCurrency(solicitud.presupuesto)}
            </div>
          </div>

          <div className="p-3 bg-card border border-lineSoft rounded-sm">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-faint mb-1">
              <Wrench size={12} className="text-rust" /> Contratista Asignado
            </span>
            <div className="font-semibold text-ink truncate">
              {solicitud.contratistas?.nombre_empresa || 'Por asignar en Licitación'}
            </div>
          </div>
        </div>

        {/* Especificaciones Técnicas de Tienda (Paso 3) */}
        {tieneSpecs && (
          <div className="p-4 bg-card border border-line rounded-sm flex flex-col gap-3">
            <h4 className="font-display font-semibold text-ink text-xs flex items-center gap-1.5 border-b border-lineSoft pb-2">
              <Maximize2 size={14} className="text-blue" />
              Especificaciones Técnicas Registradas (Paso 3)
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-white border border-lineSoft rounded">
                <span className="text-[9px] text-faint uppercase block">Área</span>
                <strong className="text-ink">{solicitud.especificaciones_tecnicas?.medidas_exactas_m2} m²</strong>
              </div>
              <div className="p-2 bg-white border border-lineSoft rounded">
                <span className="text-[9px] text-faint uppercase block">Potencia</span>
                <strong className="text-ink">{solicitud.especificaciones_tecnicas?.potencia_electrica_kw} kW</strong>
              </div>
              <div className="p-2 bg-white border border-lineSoft rounded">
                <span className="text-[9px] text-faint uppercase block">Presión ACI</span>
                <strong className="text-ink">{solicitud.especificaciones_tecnicas?.agua_contraincendio_psi} PSI</strong>
              </div>
            </div>

            {solicitud.especificaciones_tecnicas?.fotos_entorno_urls && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {solicitud.especificaciones_tecnicas.fotos_entorno_urls.map((f, i) => (
                  <img
                    key={i}
                    src={f}
                    alt={`Evidencia ${i}`}
                    className="w-full h-20 object-cover rounded border border-line"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evaluación de Cotización IA (Paso 5) */}
        {cotizacion && (
          <div className="p-4 bg-navy text-navyText rounded-sm border border-[#2A3E54] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A3E54] pb-2">
              <h4 className="font-display font-semibold text-amber text-xs flex items-center gap-1.5">
                <Cpu size={14} /> Auditoría RAG IA (Paso 5)
              </h4>
              <span className="text-[10px] font-mono text-white">
                Confianza: <strong>{cotizacion.confianza_ia}%</strong>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span>Monto Cotizado: <strong>{formatCurrency(cotizacion.monto_total)}</strong></span>
              <span className="text-rust font-bold">+{cotizacion.desviacion_pct}% sobrecosto</span>
            </div>

            <p className="text-[11px] text-navySoft leading-snug">
              {cotizacion.resultado_validacion?.motivo_desviacion}
            </p>
          </div>
        )}

        {/* Sincronización ERP (Paso 6) */}
        {erp && (
          <div className="p-3 bg-[#E9F3F0] text-teal rounded-sm border border-teal/30 text-xs font-mono flex items-center justify-between">
            <span>Sincronizado con ERP (OC: <strong>{erp.erp_documento_id}</strong>)</span>
            <ShieldCheck size={16} />
          </div>
        )}
      </div>
    </div>
  );
};
