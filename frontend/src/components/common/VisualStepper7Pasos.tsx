import React from 'react';
import type { EstadoFlujo } from '../../types/crm.types';
import { PASOS_FLUJO_CONFIG } from '../../types/crm.types';
import { Check, Clock, ChevronRight } from 'lucide-react';

interface VisualStepper7PasosProps {
  estadoActual: EstadoFlujo;
  alSeleccionarPaso?: (estado: EstadoFlujo) => void;
  compacto?: boolean;
}

const LISTA_PASOS: EstadoFlujo[] = [
  '1_NUEVO_REQUERIMIENTO',
  '2_ESPERANDO_INFO_LOCAL',
  '3_LEVANTAMIENTO_COMPLETO',
  '4_EN_LICITACION',
  '5_EVALUANDO_COTIZACIONES',
  '6_COTIZACION_APROBADA',
  '7_OBRA_VALIDADA',
];

export const VisualStepper7Pasos: React.FC<VisualStepper7PasosProps> = ({
  estadoActual,
  alSeleccionarPaso,
  compacto = false,
}) => {
  const indiceActual = LISTA_PASOS.indexOf(estadoActual);
  const estaCerrado = estadoActual === 'CERRADO';

  if (compacto) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {LISTA_PASOS.map((paso, idx) => {
          const cfg = PASOS_FLUJO_CONFIG[paso];
          const completado = estaCerrado || idx < indiceActual;
          const activo = !estaCerrado && idx === indiceActual;

          return (
            <React.Fragment key={paso}>
              <div
                onClick={() => alSeleccionarPaso?.(paso)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap cursor-pointer transition-all ${
                  activo
                    ? 'bg-navy text-navyText font-bold shadow-xs'
                    : completado
                    ? 'bg-[#E9F3F0] text-teal border border-teal/20'
                    : 'bg-card text-faint border border-line opacity-60'
                }`}
                title={`${cfg.titulo} (${cfg.responsablePrincipal})`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-white/20">
                  {completado ? <Check size={10} /> : idx + 1}
                </span>
                <span>{cfg.nombreCorto}</span>
              </div>
              {idx < LISTA_PASOS.length - 1 && (
                <ChevronRight size={12} className="text-line flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-line p-4 rounded-sm shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-lineSoft pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            Máquina de Estados Transaccional · Ciclo de 7 Pasos
          </span>
          {estaCerrado && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#EDEAD0] text-muted font-bold rounded">
              EXPEDIENTE CERRADO
            </span>
          )}
        </div>
        <span className="text-xs font-mono text-muted">
          Paso activo: <strong>{estaCerrado ? 'Cerrado' : `${indiceActual + 1} de 7`}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {LISTA_PASOS.map((paso, idx) => {
          const cfg = PASOS_FLUJO_CONFIG[paso];
          const completado = estaCerrado || idx < indiceActual;
          const activo = !estaCerrado && idx === indiceActual;

          return (
            <div
              key={paso}
              onClick={() => alSeleccionarPaso?.(paso)}
              className={`p-2.5 rounded-sm border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                activo
                  ? 'bg-navy text-navyText border-navy shadow-md ring-2 ring-amber/50'
                  : completado
                  ? 'bg-[#E9F3F0] text-ink border-teal/30 hover:border-teal'
                  : 'bg-card text-faint border-lineSoft hover:border-line'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    activo
                      ? 'bg-amber text-ink'
                      : completado
                      ? 'bg-teal text-white'
                      : 'bg-line text-faint'
                  }`}
                >
                  {completado ? <Check size={12} strokeWidth={3} /> : idx + 1}
                </span>

                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    activo
                      ? 'bg-navySoft/30 text-amber'
                      : completado
                      ? 'bg-teal/10 text-teal'
                      : 'bg-lineSoft text-faint'
                  }`}
                >
                  {cfg.responsablePrincipal}
                </span>
              </div>

              <div className="font-semibold text-xs leading-tight mb-1 truncate" title={cfg.titulo}>
                {cfg.nombreCorto}
              </div>

              <div
                className={`text-[10px] leading-tight line-clamp-2 ${
                  activo ? 'text-navySoft' : completado ? 'text-muted' : 'text-faint'
                }`}
              >
                {cfg.entregableRequerido}
              </div>

              {activo && (
                <div className="mt-2 pt-1.5 border-t border-navySoft/30 flex items-center gap-1 text-[10px] text-amber font-mono">
                  <Clock size={10} className="animate-spin" /> En curso
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
