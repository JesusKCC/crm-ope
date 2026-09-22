import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { StateBadge } from '../common/StateBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLAGauge } from '../common/SLAGauge';
import { formatCurrency } from '../../utils/formatters';
import type { PrioridadSolicitud } from '../../types/crm.types';
import { PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export const PortalComercial: React.FC = () => {
  const { solicitudes, locales, crearSolicitud, setSolicitudSeleccionada } = useSolicitudes();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localId, setLocalId] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>('Media');
  const [presupuesto, setPresupuesto] = useState<string>('25000');
  const [fechaLimite, setFechaLimite] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [enviando, setEnviando] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione un local comercial válido.' });
      return;
    }

    setEnviando(true);
    setNotificacion(null);

    const res = await crearSolicitud({
      titulo,
      descripcion,
      localId,
      prioridad,
      presupuesto: parseFloat(presupuesto) || 0,
      fechaLimite: new Date(fechaLimite).toISOString(),
    });

    setEnviando(false);
    if (res.exito) {
      setNotificacion({ tipo: 'exito', mensaje: res.mensaje });
      setTitulo('');
      setDescripcion('');
      setLocalId('');
    } else {
      setNotificacion({ tipo: 'error', mensaje: res.mensaje });
    }
  };

  const misSolicitudes = solicitudes;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Portal Comercial</h1>
        <p className="text-sm text-faint mt-1">
          Registro de nuevos requerimientos de adecuación, estimación de presupuesto preliminar y monitoreo de SLA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Nuevo Requerimiento (Paso 1) */}
        <div className="lg:col-span-1 bg-white border border-line p-5 rounded-sm shadow-xs h-fit">
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <PlusCircle className="text-blue" size={20} />
            <h2 className="font-display font-semibold text-ink text-base">
              Nuevo Requerimiento (Paso 1)
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                Local Comercial / Tienda *
              </label>
              <select
                value={localId}
                onChange={(e) => setLocalId(e.target.value)}
                className="campo-input"
                required
              >
                <option value="">Seleccione tienda...</option>
                {locales.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.codigo} — {l.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                Título del Requerimiento *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Remodelación frente de tienda y mampara"
                className="campo-input"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                Alcance y Descripción del Negocio *
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describa la necesidad comercial, objetivos del negocio y condicionantes..."
                rows={3}
                className="campo-input resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                  Prioridad
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as PrioridadSolicitud)}
                  className="campo-input"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                  Presupuesto (S/)
                </label>
                <input
                  type="number"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(e.target.value)}
                  min="0"
                  step="500"
                  className="campo-input font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                Fecha Límite Objetivo
              </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="campo-input font-mono"
                required
              />
            </div>

            {notificacion && (
              <div
                className={`p-3 rounded-xs border text-xs flex items-center gap-2 ${
                  notificacion.tipo === 'exito'
                    ? 'bg-[#E9F3F0] text-teal border-teal/40'
                    : 'bg-[#FBEAE5] text-rust border-rust/40'
                }`}
              >
                {notificacion.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{notificacion.mensaje}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 w-full bg-blue hover:bg-blue-hover text-white font-semibold py-2.5 px-4 text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              {enviando ? 'Emitiendo ticket...' : 'Registrar Solicitud'}
            </button>
          </form>
        </div>

        {/* Bandeja de Solicitudes Comerciales Activas */}
        <div className="lg:col-span-2 bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h2 className="font-display font-semibold text-ink text-base">
              Bandeja de Requerimientos Comerciales
            </h2>
            <span className="font-mono text-xs text-faint">
              {misSolicitudes.length} expedientes en curso
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-card font-mono text-[10px] uppercase tracking-wider text-faint">
                  <th className="p-2.5">SLA</th>
                  <th className="p-2.5">Código / Requerimiento</th>
                  <th className="p-2.5">Tienda</th>
                  <th className="p-2.5">Prioridad</th>
                  <th className="p-2.5">Presupuesto</th>
                  <th className="p-2.5">Estado del Flujo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lineSoft">
                {misSolicitudes.map((sol) => (
                  <tr
                    key={sol.id}
                    onClick={() => setSolicitudSeleccionada(sol)}
                    className="hover:bg-rowHover cursor-pointer transition-colors"
                  >
                    <td className="p-2.5">
                      <SLAGauge fechaLimite={sol.fecha_limite} prioridad={sol.prioridad} tamano={32} />
                    </td>
                    <td className="p-2.5">
                      <div className="font-mono text-[10px] text-faint">{sol.codigo}</div>
                      <div className="font-medium text-ink line-clamp-1">{sol.titulo}</div>
                    </td>
                    <td className="p-2.5 text-muted">
                      {sol.locales?.nombre || 'Sin asignar'}
                    </td>
                    <td className="p-2.5">
                      <PriorityBadge prioridad={sol.prioridad} />
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-ink">
                      {formatCurrency(sol.presupuesto)}
                    </td>
                    <td className="p-2.5">
                      <StateBadge estado={sol.estado_flujo} tamano="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
