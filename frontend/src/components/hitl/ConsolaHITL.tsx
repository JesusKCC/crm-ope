import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { StateBadge } from '../common/StateBadge';
import { formatCurrency } from '../../utils/formatters';
import type { ItemCotizacion } from '../../types/crm.types';
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  FileSpreadsheet
} from 'lucide-react';

export const ConsolaHITL: React.FC = () => {
  const { solicitudes, guardarDecisionHITL } = useSolicitudes();

  // Filtrar solicitudes en Paso 5: EVALUANDO_COTIZACIONES
  const solicitudesPaso5 = solicitudes.filter(
    (s) => s.estado_flujo === '5_EVALUANDO_COTIZACIONES'
  );

  const [solicitudActiva, setSolicitudActiva] = useState(
    solicitudesPaso5[0] || solicitudes.find((s) => s.cotizaciones && s.cotizaciones.length > 0) || solicitudes[0]
  );

  const cotizacion = solicitudActiva?.cotizaciones?.[0];

  // Estado editable de items (Manual Engineering Override)
  const [itemsEditables, setItemsEditables] = useState<ItemCotizacion[]>(
    cotizacion?.items || [
      {
        rubro: 'Obras Preliminares',
        descripcion: 'Desmontaje y acondicionamiento inicial',
        unidad: 'GLB',
        cantidad: 1,
        precio_unitario: 3500.0,
        precio_total: 3500.0,
        precio_referencial: 3200.0,
        desviacion_pct: 9.38,
        alerta_anomalia: false,
      },
      {
        rubro: 'Tabiquería',
        descripcion: 'Tabiquería Drywall con placa cortafuego RF-60',
        unidad: 'M2',
        cantidad: 180,
        precio_unitario: 145.0,
        precio_total: 26100.0,
        precio_referencial: 112.0,
        desviacion_pct: 29.46,
        alerta_anomalia: true,
      },
      {
        rubro: 'Pisos y Acabados',
        descripcion: 'Porcelanato tráfico pesado 60x60',
        unidad: 'M2',
        cantidad: 120,
        precio_unitario: 95.0,
        precio_total: 11400.0,
        precio_referencial: 90.0,
        desviacion_pct: 5.55,
        alerta_anomalia: false,
      },
      {
        rubro: 'Instalaciones Eléctricas',
        descripcion: 'Luminarias LED comerciales 60x60',
        unidad: 'UND',
        cantidad: 25,
        precio_unitario: 300.0,
        precio_total: 7500.0,
        precio_referencial: 240.0,
        desviacion_pct: 25.0,
        alerta_anomalia: true,
      },
    ]
  );

  const [modoEdicion, setModoEdicion] = useState(false);
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultadoAccion, setResultadoAccion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  const handleSeleccionarSolicitud = (sol: typeof solicitudActiva) => {
    setSolicitudActiva(sol);
    setResultadoAccion(null);
    setModoEdicion(false);
    if (sol?.cotizaciones?.[0]?.items) {
      setItemsEditables(sol.cotizaciones[0].items);
    }
  };

  const handleItemChange = (index: number, campo: keyof ItemCotizacion, valor: number | string) => {
    setItemsEditables((prev) => {
      const actualizados = [...prev];
      const item = { ...actualizados[index], [campo]: valor };
      if (campo === 'cantidad' || campo === 'precio_unitario') {
        item.precio_total = Number(item.cantidad) * Number(item.precio_unitario);
        if (item.precio_referencial) {
          const refTotal = Number(item.cantidad) * Number(item.precio_referencial);
          item.desviacion_pct = Number((((item.precio_total - refTotal) / refTotal) * 100).toFixed(2));
          item.alerta_anomalia = item.desviacion_pct > 15;
        }
      }
      actualizados[index] = item;
      return actualizados;
    });
  };

  const totalCalculado = itemsEditables.reduce((acc, i) => acc + (i.precio_total || 0), 0);
  const totalReferencial = itemsEditables.reduce((acc, i) => acc + ((i.precio_referencial || i.precio_unitario) * i.cantidad), 0);
  const desviacionTotalPct = totalReferencial > 0 ? ((totalCalculado - totalReferencial) / totalReferencial) * 100 : 0;

  const handleAprobarAdjudicar = async () => {
    if (!solicitudActiva || !cotizacion) return;
    setProcesando(true);
    setResultadoAccion(null);

    const res = await guardarDecisionHITL(
      solicitudActiva.id,
      cotizacion.id,
      'Aprobar',
      itemsEditables,
      motivoAjuste || 'Aprobado por Ingeniería en Consola HITL con sobreescritura técnica.'
    );

    setProcesando(false);
    if (res.exito) {
      setResultadoAccion({ tipo: 'exito', mensaje: res.mensaje });
    } else {
      setResultadoAccion({ tipo: 'error', mensaje: res.mensaje });
    }
  };

  const handleRechazarRelicitar = async () => {
    if (!solicitudActiva || !cotizacion) return;
    setProcesando(true);
    setResultadoAccion(null);

    const res = await guardarDecisionHITL(
      solicitudActiva.id,
      cotizacion.id,
      'Rechazar',
      undefined,
      motivoAjuste || 'Rechazado por desviación excesiva de costos.'
    );

    setProcesando(false);
    if (res.exito) {
      setResultadoAccion({ tipo: 'exito', mensaje: res.mensaje });
    } else {
      setResultadoAccion({ tipo: 'error', mensaje: res.mensaje });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <Cpu className="text-amber" size={26} />
            Consola Human-in-the-Loop (HITL) — Auditoría de Cotizaciones
          </h1>
          <p className="text-sm text-faint mt-1">
            Paso 5: Inspección de propuestas económicas extraídas con IA/RAG vs base de precios de referencia. Control y sobreescritura manual por Ingeniería.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModoEdicion(!modoEdicion)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm border transition-all flex items-center gap-2 ${
              modoEdicion
                ? 'bg-amber text-ink border-amber shadow-xs'
                : 'bg-white border-line text-ink hover:bg-lineSoft'
            }`}
          >
            <Edit3 size={14} />
            {modoEdicion ? 'Modo Sobreescritura Activo' : 'Habilitar Edición Manual'}
          </button>
        </div>
      </div>

      {resultadoAccion && (
        <div
          className={`p-4 rounded-sm border text-sm flex items-center gap-2 ${
            resultadoAccion.tipo === 'exito'
              ? 'bg-[#E9F3F0] text-teal border-teal/40'
              : 'bg-[#FBEAE5] text-rust border-rust/40'
          }`}
        >
          {resultadoAccion.tipo === 'exito' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{resultadoAccion.mensaje}</span>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector de Tickets en Evaluación */}
        <div className="lg:col-span-1 bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col gap-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-faint border-b border-line pb-2">
            Tickets en Evaluación ({solicitudesPaso5.length})
          </div>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {solicitudes.map((sol) => {
              const activo = solicitudActiva?.id === sol.id;
              const tieneCot = sol.cotizaciones && sol.cotizaciones.length > 0;

              return (
                <button
                  key={sol.id}
                  onClick={() => handleSeleccionarSolicitud(sol)}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    activo
                      ? 'border-amber bg-[#FBF2E3] ring-1 ring-amber'
                      : 'border-lineSoft bg-card hover:bg-rowHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-faint">{sol.codigo}</span>
                    <StateBadge estado={sol.estado_flujo} tamano="sm" />
                  </div>
                  <div className="font-medium text-xs text-ink line-clamp-1">{sol.titulo}</div>
                  <div className="text-[10px] font-mono text-muted mt-1">
                    {sol.contratistas?.nombre_empresa || 'Contratista Postulante'}
                  </div>
                  {tieneCot && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-rust font-bold">
                      <AlertTriangle size={10} /> {sol.cotizaciones?.[0]?.desviacion_pct || 15.5}% sobrecosto
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Auditoría HITL Detallado */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Banner de Diagnóstico del Motor de IA */}
          <div className="bg-navy text-navyText p-5 rounded-sm border border-[#2A3E54] shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A3E54] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-bold">
                    Evaluación Asíncrona RAG Completada
                  </span>
                </div>
                <h2 className="text-lg font-display font-bold text-white mt-1">
                  {solicitudActiva?.titulo}
                </h2>
                <div className="text-xs text-navySoft font-mono mt-0.5">
                  Proveedor: <strong>{solicitudActiva?.contratistas?.nombre_empresa || 'Obras Express S.A.C.'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="block text-[10px] font-mono uppercase text-navySoft">Confianza IA</span>
                  <span className="text-2xl font-mono font-bold text-amber">
                    {cotizacion?.confianza_ia || 94.5}%
                  </span>
                </div>

                <div className="text-center">
                  <span className="block text-[10px] font-mono uppercase text-navySoft">Desviación Total</span>
                  <span
                    className={`text-2xl font-mono font-bold ${
                      desviacionTotalPct > 10 ? 'text-rust' : 'text-teal'
                    }`}
                  >
                    {desviacionTotalPct > 0 ? `+${desviacionTotalPct.toFixed(1)}%` : `${desviacionTotalPct.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-navySoft leading-relaxed">
              <strong>Dictamen RAG:</strong> {cotizacion?.resultado_validacion?.motivo_desviacion || 'Partida de tabiquería acústica RF-60 presenta sobrecosto de +29.5% sobre la mediana histórica de compras del Mall.'}
            </div>
          </div>

          {/* Tabla de Desglose de Partidas con Comparación de Precios de Referencia */}
          <div className="bg-white border border-line p-5 rounded-sm shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                <FileSpreadsheet className="text-blue" size={16} />
                Desglose de Partidas vs Base de Precios de Referencia (pgvector)
              </h3>
              <span className="font-mono text-xs text-faint">
                {itemsEditables.length} partidas evaluadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line bg-card font-mono text-[10px] uppercase tracking-wider text-faint">
                    <th className="p-2.5">Rubro / Partida</th>
                    <th className="p-2.5">Unidad</th>
                    <th className="p-2.5 text-right">Cant.</th>
                    <th className="p-2.5 text-right">P. Unitario (Cotizado)</th>
                    <th className="p-2.5 text-right">P. Unit. Referencial</th>
                    <th className="p-2.5 text-right">Desviación</th>
                    <th className="p-2.5 text-right">Total Partida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lineSoft">
                  {itemsEditables.map((item, idx) => {
                    const sobrecosto = (item.desviacion_pct || 0) > 15;

                    return (
                      <tr key={idx} className={sobrecosto ? 'bg-[#FBEAE5]/30' : ''}>
                        <td className="p-2.5">
                          <span className="text-[10px] font-mono text-faint block">{item.rubro}</span>
                          <span className="font-medium text-ink">{item.descripcion}</span>
                        </td>
                        <td className="p-2.5 font-mono text-faint">{item.unidad}</td>
                        <td className="p-2.5 text-right font-mono">
                          {modoEdicion ? (
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => handleItemChange(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                              className="w-16 text-right campo-input py-1 px-1 font-mono text-xs"
                            />
                          ) : (
                            item.cantidad
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold">
                          {modoEdicion ? (
                            <input
                              type="number"
                              value={item.precio_unitario}
                              onChange={(e) => handleItemChange(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right campo-input py-1 px-1 font-mono text-xs"
                            />
                          ) : (
                            formatCurrency(item.precio_unitario)
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-faint">
                          {formatCurrency(item.precio_referencial || item.precio_unitario)}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sobrecosto
                                ? 'bg-rust text-white'
                                : (item.desviacion_pct || 0) > 0
                                ? 'bg-[#FBF2E3] text-amber'
                                : 'bg-[#E9F3F0] text-teal'
                            }`}
                          >
                            {(item.desviacion_pct || 0) > 0 ? `+${item.desviacion_pct}%` : `${item.desviacion_pct || 0}%`}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-ink">
                          {formatCurrency(item.precio_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line bg-card font-mono text-xs font-bold">
                    <td colSpan={4} className="p-3 text-right uppercase text-faint">
                      Total Cotización Auditada:
                    </td>
                    <td className="p-3 text-right text-faint">
                      {formatCurrency(totalReferencial)}
                    </td>
                    <td className="p-3 text-right text-rust">
                      +{desviacionTotalPct.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-base text-ink">
                      {formatCurrency(totalCalculado)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Motivo de Override / Nota de Ingeniería */}
            <div className="mt-4 pt-4 border-t border-lineSoft flex flex-col gap-2">
              <label className="font-mono text-[11px] uppercase tracking-wide text-faint">
                Observación / Justificación Técnica de Ingeniería (Auditoría Inmutable)
              </label>
              <textarea
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
                placeholder="Especifique el criterio de aprobación, ajuste pactado o causal de relicitación..."
                rows={2}
                className="campo-input resize-none text-xs"
              />
            </div>

            {/* Controles de Decisión HITL */}
            <div className="mt-5 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleRechazarRelicitar}
                disabled={procesando}
                className="bg-card border border-rust text-rust hover:bg-[#FBEAE5] font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle size={16} />
                Rechazar y Relicitar (Retornar a Paso 4)
              </button>

              <button
                onClick={handleAprobarAdjudicar}
                disabled={procesando}
                className="bg-teal hover:bg-teal/90 text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Check size={16} strokeWidth={3} />
                {procesando
                  ? 'Sincronizando con ERP...'
                  : 'Aprobar y Adjudicar Propuesta (Avanzar a Paso 6)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
