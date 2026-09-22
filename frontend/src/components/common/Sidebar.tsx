import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Cpu,
  Camera,
  BarChart3,
  BookOpen,
  Store,
  Briefcase
} from 'lucide-react';

export type VistaNavegacion =
  | 'operativo'
  | 'comercial'
  | 'gerente_tienda'
  | 'proveedor'
  | 'hitl_cotizaciones'
  | 'hitl_obra'
  | 'analytics'
  | 'formatos';

interface SidebarProps {
  vistaActual: VistaNavegacion;
  alCambiarVista: (vista: VistaNavegacion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  vistaActual,
  alCambiarVista,
}) => {
  const { rolActivo } = useAuth();

  const items = [
    {
      id: 'operativo' as VistaNavegacion,
      label: 'Matriz Operativa',
      sublabel: 'Visión Global 7 Pasos',
      icon: LayoutDashboard,
      roles: ['ingeniero', 'supervisor', 'admin', 'finanzas', 'comercial', 'gerente_tienda', 'proveedor'],
    },
    {
      id: 'comercial' as VistaNavegacion,
      label: 'Portal Comercial',
      sublabel: 'Paso 1: Requerimientos',
      icon: PlusCircle,
      roles: ['comercial', 'ingeniero', 'admin'],
    },
    {
      id: 'gerente_tienda' as VistaNavegacion,
      label: 'Portal Gerente Tienda',
      sublabel: 'Paso 3: Levantamiento',
      icon: Store,
      roles: ['gerente_tienda', 'ingeniero', 'admin'],
    },
    {
      id: 'proveedor' as VistaNavegacion,
      label: 'Portal Contratista',
      sublabel: 'Paso 4 y 7: Ofertas y Fin Obra',
      icon: Briefcase,
      roles: ['proveedor', 'ingeniero', 'admin'],
    },
    {
      id: 'hitl_cotizaciones' as VistaNavegacion,
      label: 'Consola HITL Cotizaciones',
      sublabel: 'Paso 5: Auditoría RAG',
      icon: Cpu,
      roles: ['ingeniero', 'supervisor', 'admin'],
      badge: 'IA',
    },
    {
      id: 'hitl_obra' as VistaNavegacion,
      label: 'Inspector Obra Multimodal',
      sublabel: 'Paso 7: Visión y Checklist',
      icon: Camera,
      roles: ['ingeniero', 'supervisor', 'admin'],
      badge: 'Visión',
    },
    {
      id: 'analytics' as VistaNavegacion,
      label: 'Dashboard Analítico BI',
      sublabel: 'KPIs y Vistas Materializadas',
      icon: BarChart3,
      roles: ['finanzas', 'supervisor', 'admin', 'ingeniero'],
    },
    {
      id: 'formatos' as VistaNavegacion,
      label: 'Formatos Especialista',
      sublabel: 'Lineamientos RAG',
      icon: BookOpen,
      roles: ['ingeniero', 'admin'],
    },
  ];

  const itemsVisibles = items.filter((item) =>
    item.roles.includes(rolActivo) || rolActivo === 'admin'
  );

  return (
    <aside className="w-64 bg-card border-r border-line flex flex-col flex-shrink-0 min-h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-line">
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
          Módulos y Portales
        </span>
      </div>

      <nav className="p-3 flex flex-col gap-1 flex-1">
        {itemsVisibles.map((item) => {
          const Icon = item.icon;
          const activo = vistaActual === item.id;

          return (
            <button
              key={item.id}
              onClick={() => alCambiarVista(item.id)}
              className={`w-full flex items-start gap-3 p-2.5 rounded-sm text-left transition-all relative ${
                activo
                  ? 'bg-navy text-navyText shadow-xs'
                  : 'text-inkSoft hover:bg-lineSoft hover:text-ink'
              }`}
            >
              <Icon
                size={18}
                className={`mt-0.5 flex-shrink-0 ${
                  activo ? 'text-amber' : 'text-faint'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs truncate leading-tight">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        activo ? 'bg-amber text-ink font-bold' : 'bg-line text-muted'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    activo ? 'text-navySoft' : 'text-faint'
                  }`}
                >
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-line bg-white/50 text-[11px] font-mono text-faint">
        <div>PostgreSQL + pgvector</div>
        <div className="text-[10px] text-muted mt-0.5">Vistas Materializadas Sync</div>
      </div>
    </aside>
  );
};
