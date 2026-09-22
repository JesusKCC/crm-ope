import React from 'react';
import { calculateRemainingDays } from '../../utils/formatters';

interface SLAGaugeProps {
  fechaLimite: string | null;
  prioridad?: string;
  tamano?: number;
}

export const SLAGauge: React.FC<SLAGaugeProps> = ({
  fechaLimite,
  tamano = 36,
}) => {
  if (!fechaLimite) {
    return (
      <div
        className="rounded-full bg-lineSoft flex items-center justify-center flex-shrink-0"
        style={{ width: tamano, height: tamano }}
        title="Sin fecha límite definida"
      >
        <span className="text-[9px] font-mono text-faint">--</span>
      </div>
    );
  }

  const { days, isOverdue, status } = calculateRemainingDays(fechaLimite);

  let color = '#3F7A6E'; // teal (normal)
  if (status === 'warning') color = '#E8A33D'; // amber
  if (status === 'critical' || isOverdue) color = '#C4432A'; // rust

  const r = (tamano / 2) - 4;
  const c = 2 * Math.PI * r;
  const pct = isOverdue ? 1 : Math.max(0, Math.min(1, 1 - days / 20));
  const offset = c * (1 - pct);

  const textoDisplay = isOverdue ? `-${days}d` : `${days}d`;
  const tooltip = isOverdue
    ? `⚠️ VENCIDO por ${days} días (${new Date(fechaLimite).toLocaleDateString('es-PE')})`
    : `${days} días restantes para cumplimiento de SLA (${new Date(fechaLimite).toLocaleDateString('es-PE')})`;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center cursor-help"
      style={{ width: tamano, height: tamano }}
      title={tooltip}
    >
      <svg
        width={tamano}
        height={tamano}
        viewBox={`0 0 ${tamano} ${tamano}`}
        className="-rotate-90 transform"
      >
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={r}
          fill="none"
          stroke="#E7E2D6"
          strokeWidth="3"
        />
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold"
        style={{ color }}
      >
        {textoDisplay}
      </span>
    </div>
  );
};
