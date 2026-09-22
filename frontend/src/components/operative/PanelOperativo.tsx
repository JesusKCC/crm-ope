import React, { useState, useMemo } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { StateBadge } from '../common/StateBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLAGauge } from '../common/SLAGauge';
import { VisualStepper7Pasos } from '../common/VisualStepper7Pasos';
import { DetalleSolicitudDrawer } from './DetalleSolicitudDrawer';
import { TransicionEstadoModal } from './TransicionEstadoModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { EstadoFlujo, SolicitudConRelaciones } from '../../types/crm.types';
import {
  Search,
  ChevronRight,
  Plus
} from 'lucide-react';

interface PanelOperativoProps {
  alCrearSolicitud?: () => void;
}

export const PanelOperativo: React.FC<PanelOperativoProps> = ({
  alCrearSolicitud,
}) => {
  const {
    solicitudes,
    loading,
    solicitudSeleccionada,
    setSolicitudSeleccionada
  } = useSolicitudes();

  const [busqueda, setBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('Todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [modalTransicionAbierto, setModalTransicionAbierto] = useState(false);
  const [solicitudParaTransicionar, setSolicitudParaTransicionar] = useState<SolicitudConRelaciones | null>(null);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      const coincideBusqueda =
        busqueda === '' ||
        s.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (s.locales?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());

      const coincidePrioridad =
        filtroPrioridad === 'Todas' || s.prioridad === filtroPrioridad;

      const coincideEstado =
        filtroEstado === 'Todos' || s.estado_flujo === filtroEstado;

      return coincideBusqueda && coincidePrioridad && coincideEstado;
    });
  }, [solicitudes, busqueda, filtroPrioridad, filtroEstado]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Stepper Superior */}
      <VisualStepper7Pasos
        estadoActual={
          (filtroEstado !== 'Todos'
            ? (filtroEstado as EstadoFlujo)
            : '5_EVALUANDO_COTIZACIONES')
        }
        alSeleccionarPaso={(paso) => setFiltroEstado(paso)}
      />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-line p-4 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-2.5 text-faint" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código (SOL-00001), título o local comercial..."
            className="campo-input pl-9 text-xs"
          />
        </div>

        {/* Filtros de Prioridad */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase text-faint mr-1">Prioridad:</span>
          {['Todas', 'Urgente', 'Alta', 'Media', 'Baja'].map((p) => (
            <button
              key={p}
              onClick={() => setFiltroPrioridad(p)}
              className={`text-xs font-mono px-2.5 py-1 rounded-xs border transition-all ${
                filtroPrioridad === p
                  ? 'bg-navy text-navyText border-navy font-bold'
                  : 'bg-card border-lineSoft text-muted hover:bg-lineSoft'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Reset / Estado */}
        <div className="flex items-center gap-2">
          {filtroEstado !== 'Todos' && (
            <button
              onClick={() => setFiltroEstado('Todos')}
              className="text-xs font-mono text-rust hover:underline flex items-center gap-1"
            >
              Limpiar paso ({filtroEstado.split('_')[0]})
            </button>
          )}

          {alCrearSolicitud && (
            <button
              onClick={alCrearSolicitud}
              className="bg-blue hover:bg-blue-hover text-white text-xs font-mono uppercase font-bold px-3 py-1.5 rounded-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Tabla Maestra Operativa */}
      <div className="bg-white border border-line rounded-sm shadow-xs overflow-hidden relative">
        <div className="grid grid-cols-[40px_100px_1fr_160px_90px_110px_170px_40px] gap-3 p-3.5 border-b border-line bg-card text-[10px] font-mono uppercase tracking-wider text-faint items-center">
          <span>SLA</span>
          <span>Código</span>
          <span>Solicitud / Requerimiento</span>
          <span>Local Comercial</span>
          <span>Prioridad</span>
          <span className="text-right">Presupuesto</span>
          <span>Estado Transaccional</span>
          <span></span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-faint font-mono animate-pulse">
            Cargando matriz operativa desde PostgreSQL...
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-sm text-faint">
            No se encontraron expedientes con los criterios seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-lineSoft">
            {solicitudesFiltradas.map((sol) => (
              <div
                key={sol.id}
                onClick={() => setSolicitudSeleccionada(sol)}
                className="grid grid-cols-[40px_100px_1fr_160px_90px_110px_170px_40px] gap-3 p-3 items-center hover:bg-rowHover cursor-pointer transition-colors"
              >
                <SLAGauge fechaLimite={sol.fecha_limite} prioridad={sol.prioridad} tamano={32} />

                <span className="font-mono text-xs font-bold text-ink truncate">
                  {sol.codigo}
                </span>

                <div className="min-w-0">
                  <div className="font-medium text-xs text-ink truncate">{sol.titulo}</div>
                  <div className="text-[10px] text-faint truncate font-mono">
                    {formatDate(sol.created_at)}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs text-inkSoft truncate">{sol.locales?.nombre || 'Sin local'}</div>
                  <div className="text-[10px] text-faint font-mono truncate">{sol.locales?.centro_comercial}</div>
                </div>

                <div>
                  <PriorityBadge prioridad={sol.prioridad} />
                </div>

                <div className="text-right font-mono text-xs font-bold text-ink">
                  {formatCurrency(sol.presupuesto)}
                </div>

                <div>
                  <StateBadge estado={sol.estado_flujo} tamano="sm" />
                </div>

                <div className="text-right">
                  <ChevronRight size={16} className="text-line inline" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Lateral de Detalle */}
      {solicitudSeleccionada && (
        <DetalleSolicitudDrawer
          solicitud={solicitudSeleccionada}
          onCerrar={() => setSolicitudSeleccionada(null)}
          onAbrirTransicion={() => {
            setSolicitudParaTransicionar(solicitudSeleccionada);
            setModalTransicionAbierto(true);
          }}
        />
      )}

      {/* Modal de Transición de Estado */}
      <TransicionEstadoModal
        solicitud={solicitudParaTransicionar}
        abierto={modalTransicionAbierto}
        onCerrar={() => {
          setModalTransicionAbierto(false);
          setSolicitudParaTransicionar(null);
        }}
      />
    </div>
  );
};
