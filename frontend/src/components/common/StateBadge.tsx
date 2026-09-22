import React from 'react';
import type { EstadoFlujo } from '../../types/crm.types';
import { PASOS_FLUJO_CONFIG } from '../../types/crm.types';

interface StateBadgeProps {
  estado: EstadoFlujo;
  tamano?: 'sm' | 'md' | 'lg';
  mostrarPaso?: boolean;
}

export const StateBadge: React.FC<StateBadgeProps> = ({
  estado,
  tamano = 'md',
  mostrarPaso = true,
}) => {
  const config = PASOS_FLUJO_CONFIG[estado] || PASOS_FLUJO_CONFIG['1_NUEVO_REQUERIMIENTO'];

  const clasesTamano = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[tamano];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-sm border ${clasesTamano}`}
      style={{
        backgroundColor: config.bgHex,
        borderColor: `${config.colorHex}40`,
        color: config.colorHex,
      }}
      title={config.descripcion}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
        style={{ backgroundColor: config.colorHex }}
      />
      {mostrarPaso ? config.nombreCorto : estado.replace(/_/g, ' ')}
    </span>
  );
};
