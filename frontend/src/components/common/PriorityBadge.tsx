import React from 'react';
import type { PrioridadSolicitud } from '../../types/crm.types';
import { AlertTriangle, Clock, ArrowDown, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  prioridad: PrioridadSolicitud;
}

const CONFIG_PRIORIDAD: Record<
  PrioridadSolicitud,
  { text: string; bg: string; border: string; icon: React.ReactNode }
> = {
  Urgente: {
    text: 'text-rust font-bold',
    bg: 'bg-[#FBEAE5]',
    border: 'border-rust',
    icon: <Flame size={12} className="text-rust animate-bounce" />,
  },
  Alta: {
    text: 'text-rust',
    bg: 'bg-[#FBEAE5]',
    border: 'border-[#E8A33D]',
    icon: <AlertTriangle size={12} className="text-rust" />,
  },
  Media: {
    text: 'text-amber',
    bg: 'bg-[#FBF2E3]',
    border: 'border-[#E8A33D]',
    icon: <Clock size={12} className="text-amber" />,
  },
  Baja: {
    text: 'text-teal',
    bg: 'bg-[#E9F3F0]',
    border: 'border-teal',
    icon: <ArrowDown size={12} className="text-teal" />,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ prioridad }) => {
  const config = CONFIG_PRIORIDAD[prioridad] || CONFIG_PRIORIDAD.Media;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase tracking-wider border ${config.text} ${config.bg} ${config.border}`}
    >
      {config.icon}
      {prioridad}
    </span>
  );
};
