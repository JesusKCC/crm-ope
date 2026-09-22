import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { RolUsuario } from '../../types/crm.types';
import { Shield, LogOut, UserCheck, Layers } from 'lucide-react';

interface HeaderProps {
  vistaActual?: string;
  onCambiarVista?: (vista: string) => void;
}

const ROLES_DISPONIBLES: { rol: RolUsuario; label: string; desc: string }[] = [
  { rol: 'comercial', label: 'Comercial', desc: 'Paso 1: Registro y Presupuesto' },
  { rol: 'ingeniero', label: 'Ingeniero / HITL', desc: 'Gobernanza completa, Paso 2-7 y HITL' },
  { rol: 'gerente_tienda', label: 'Gerente Tienda', desc: 'Paso 3: Levantamiento y Medidas' },
  { rol: 'proveedor', label: 'Proveedor / Contratista', desc: 'Paso 4: Cotizar y Paso 7: Entregar Obra' },
  { rol: 'supervisor', label: 'Supervisor', desc: 'Aprobaciones y Control de SLA' },
  { rol: 'finanzas', label: 'Finanzas', desc: 'BI Analytics y Control de Sobrecostos' },
  { rol: 'admin', label: 'Administrador General', desc: 'Acceso y Control Total' },
];

export const Header: React.FC<HeaderProps> = () => {
  const { profile, rolActivo, cambiarRolSimulado, signOut, modoDesarrollo } = useAuth();

  return (
    <header className="bg-navy text-navyText border-b border-[#2A3E54] shadow-md sticky top-0 z-40">
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo y Título */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber text-ink font-mono font-bold text-lg flex items-center justify-center rounded-sm shadow-xs">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white">
                CRM MEJORA
              </span>
              <span className="bg-[#2B4C6F] text-navySoft text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs">
                v2.4 Prod
              </span>
            </div>
            <p className="text-[11px] font-mono text-navySoft">
              Centro de Operaciones Inteligente y Control de Obras
            </p>
          </div>
        </div>

        {/* Selector de Rol Activo (Simulador / Switcher de 7 Roles) */}
        <div className="flex items-center gap-3 bg-[#13202E] px-3 py-1.5 rounded-sm border border-[#2A3E54]">
          <div className="flex items-center gap-1.5 text-amber text-xs font-mono">
            <UserCheck size={14} />
            <span className="text-[10px] uppercase tracking-wider text-navySoft">Rol Activo:</span>
          </div>
          <select
            value={rolActivo}
            onChange={(e) => cambiarRolSimulado(e.target.value as RolUsuario)}
            className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer border-b border-amber/40 pb-0.5 hover:border-amber transition-colors"
          >
            {ROLES_DISPONIBLES.map((r) => (
              <option key={r.rol} value={r.rol} className="bg-navy text-white">
                {r.label} ({r.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Perfil y Acciones */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">{profile?.nombre_completo}</div>
            <div className="text-[10px] font-mono text-navySoft flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block" />
              {profile?.correo}
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-navySoft hover:text-white px-3 py-1.5 rounded-xs border border-navySoft/30 hover:border-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Franja de Estado RLS / Motor Transaccional */}
      <div className="px-6 py-1.5 bg-[#13202E] border-t border-[#223347] flex items-center justify-between text-[11px] font-mono text-navySoft">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-teal" />
          <span>
            Motor RLS PostgreSQL Activo · Políticas de aislamiento aplicadas para:{' '}
            <strong className="text-amber uppercase">{rolActivo}</strong>
          </span>
        </div>
        {modoDesarrollo && (
          <div className="flex items-center gap-1.5 text-amber">
            <Layers size={12} />
            <span>Modo Mock Reactivo Habilitado</span>
          </div>
        )}
      </div>
    </header>
  );
};
