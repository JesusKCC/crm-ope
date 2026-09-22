import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { StateBadge } from '../common/StateBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLAGauge } from '../common/SLAGauge';
import {
  Store,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  Droplets,
  Maximize2
} from 'lucide-react';

export const PortalGerenteTienda: React.FC = () => {
  const { solicitudes, guardarEspecificacionesTecnicas } = useSolicitudes();

  // Filtrar solicitudes relevantes para tienda (Paso 2, 3 o asignadas a su local)
  const ticketsPendientes = solicitudes.filter(
    (s) => s.estado_flujo === '2_ESPERANDO_INFO_LOCAL' || s.estado_flujo === '3_LEVANTAMIENTO_COMPLETO'
  );

  const [ticketActivo, setTicketActivo] = useState(ticketsPendientes[0] || solicitudes[0]);
  const [medidasM2, setMedidasM2] = useState<string>(
    String(ticketActivo?.especificaciones_tecnicas?.medidas_exactas_m2 || '145.5')
  );
  const [potenciaKw, setPotenciaKw] = useState<string>(
    String(ticketActivo?.especificaciones_tecnicas?.potencia_electrica_kw || '22.0')
  );
  const [aguaPsi, setAguaPsi] = useState<string>(
    String(ticketActivo?.especificaciones_tecnicas?.agua_contraincendio_psi || '65.0')
  );
  const [tipoLocal, setTipoLocal] = useState<string>(
    ticketActivo?.especificaciones_tecnicas?.tipo_local || 'Local Comercial Retail'
  );
  const [horarioRestriccion, setHorarioRestriccion] = useState<string>('Trabajo nocturno 22:00 a 06:00 hrs');
  const [fotos, setFotos] = useState<string[]>(
    ticketActivo?.especificaciones_tecnicas?.fotos_entorno_urls || [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    ]
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleSeleccionarTicket = (sol: typeof ticketActivo) => {
    setTicketActivo(sol);
    setMensaje(null);
    if (sol?.especificaciones_tecnicas) {
      setMedidasM2(String(sol.especificaciones_tecnicas.medidas_exactas_m2));
      setPotenciaKw(String(sol.especificaciones_tecnicas.potencia_electrica_kw));
      setAguaPsi(String(sol.especificaciones_tecnicas.agua_contraincendio_psi));
      setTipoLocal(sol.especificaciones_tecnicas.tipo_local);
      setFotos(sol.especificaciones_tecnicas.fotos_entorno_urls || []);
    } else {
      setMedidasM2('120.0');
      setPotenciaKw('15.0');
      setAguaPsi('60.0');
    }
  };

  const handleGuardarLevantamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketActivo) return;

    setGuardando(true);
    setMensaje(null);

    const res = await guardarEspecificacionesTecnicas(ticketActivo.id, {
      medidas_exactas_m2: parseFloat(medidasM2) || 0,
      potencia_electrica_kw: parseFloat(potenciaKw) || 0,
      agua_contraincendio_psi: parseFloat(aguaPsi) || 0,
      tipo_local: tipoLocal,
      planos_url: 'https://storage.supabase.co/planos/plano_levantamiento_tienda.pdf',
      fotos_entorno_urls: fotos,
      otros_requerimientos: { horario: horarioRestriccion },
    });

    setGuardando(false);
    if (res.exito) {
      setMensaje({ tipo: 'exito', texto: res.mensaje });
    } else {
      setMensaje({ tipo: 'error', texto: res.mensaje });
    }
  };

  const handleAgregarFotoSimulada = () => {
    const nuevaFoto = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80';
    setFotos((prev) => [...prev, nuevaFoto]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
          <Store className="text-amber" size={26} />
          Portal de Gerencia de Tienda
        </h1>
        <p className="text-sm text-faint mt-1">
          Levantamiento técnico en sitio (Pasos 2 y 3). Validación de medidas físicas, capacidad eléctrica, agua contraincendios y subida de planos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Requerimientos de la Tienda */}
        <div className="lg:col-span-1 bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-display font-semibold text-ink text-sm">
              Requerimientos de Tienda
            </h2>
            <span className="text-[10px] font-mono text-faint">
              {ticketsPendientes.length} pendientes
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
            {solicitudes.map((sol) => {
              const seleccionado = ticketActivo?.id === sol.id;
              const requiereLevantamiento = sol.estado_flujo === '2_ESPERANDO_INFO_LOCAL';

              return (
                <button
                  key={sol.id}
                  onClick={() => handleSeleccionarTicket(sol)}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    seleccionado
                      ? 'border-amber bg-[#FBF2E3] ring-1 ring-amber'
                      : 'border-lineSoft bg-card hover:bg-rowHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-faint">{sol.codigo}</span>
                    <PriorityBadge prioridad={sol.prioridad} />
                  </div>
                  <div className="font-medium text-xs text-ink line-clamp-1">{sol.titulo}</div>
                  <div className="text-[11px] text-muted mt-1">{sol.locales?.nombre}</div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-lineSoft/60">
                    <StateBadge estado={sol.estado_flujo} tamano="sm" />
                    {requiereLevantamiento && (
                      <span className="text-[10px] font-mono font-bold text-rust flex items-center gap-1">
                        <AlertTriangle size={12} /> Acción req.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Levantamiento Técnico (Paso 3) */}
        <div className="lg:col-span-2 bg-white border border-line p-6 rounded-sm shadow-xs flex flex-col">
          {ticketActivo ? (
            <form onSubmit={handleGuardarLevantamiento} className="flex flex-col gap-5">
              <div className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-xs text-faint">{ticketActivo.codigo}</div>
                  <h2 className="text-lg font-display font-bold text-ink mt-0.5">
                    {ticketActivo.titulo}
                  </h2>
                  <p className="text-xs text-muted mt-1">{ticketActivo.descripcion}</p>
                </div>
                <div className="flex items-center gap-3">
                  <SLAGauge fechaLimite={ticketActivo.fecha_limite} prioridad={ticketActivo.prioridad} />
                  <StateBadge estado={ticketActivo.estado_flujo} />
                </div>
              </div>

              {/* Parámetros Técnicos Críticos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-card border border-line rounded-sm">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-faint mb-1">
                    <Maximize2 size={14} className="text-blue" /> Medidas Exactas (m²) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={medidasM2}
                    onChange={(e) => setMedidasM2(e.target.value)}
                    className="campo-input font-mono font-bold text-base text-ink"
                    required
                  />
                  <span className="text-[10px] text-faint font-mono">Área útil intervenida</span>
                </div>

                <div className="p-3 bg-card border border-line rounded-sm">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-faint mb-1">
                    <Zap size={14} className="text-amber" /> Potencia Disponible (kW) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={potenciaKw}
                    onChange={(e) => setPotenciaKw(e.target.value)}
                    className="campo-input font-mono font-bold text-base text-ink"
                    required
                  />
                  <span className="text-[10px] text-faint font-mono">Carga asignada en tablero</span>
                </div>

                <div className="p-3 bg-card border border-line rounded-sm">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-faint mb-1">
                    <Droplets size={14} className="text-teal" /> Presión Red ACI (PSI) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={aguaPsi}
                    onChange={(e) => setAguaPsi(e.target.value)}
                    className="campo-input font-mono font-bold text-base text-ink"
                    required
                  />
                  <span className="text-[10px] text-faint font-mono">Presión en manómetro troncal</span>
                </div>
              </div>

              {/* Categoría y Restricciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                    Tipo de Local Comercial
                  </label>
                  <select
                    value={tipoLocal}
                    onChange={(e) => setTipoLocal(e.target.value)}
                    className="campo-input"
                  >
                    <option value="Local Comercial Retail">Local Comercial Retail</option>
                    <option value="Isla Comercial / Módulo">Isla Comercial / Módulo</option>
                    <option value="Gastronómico / Restaurante">Gastronómico / Restaurante</option>
                    <option value="Almacén / Logística">Almacén / Logística</option>
                    <option value="Servicios Financieros">Servicios Financieros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                    Restricciones de Acceso y Horario
                  </label>
                  <input
                    type="text"
                    value={horarioRestriccion}
                    onChange={(e) => setHorarioRestriccion(e.target.value)}
                    className="campo-input"
                  />
                </div>
              </div>

              {/* Galería de Fotos del Entorno */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-[11px] uppercase tracking-wide text-faint flex items-center gap-1.5">
                    <Camera size={14} /> Registro Fotográfico del Entorno ({fotos.length} fotos)
                  </label>
                  <button
                    type="button"
                    onClick={handleAgregarFotoSimulada}
                    className="text-xs text-blue font-semibold hover:underline flex items-center gap-1"
                  >
                    <Upload size={12} /> + Adjuntar Foto
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-sm overflow-hidden border border-line group h-28 bg-black/5">
                      <img src={url} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                        Foto {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plano Técnico Adjunto */}
              <div className="p-3 bg-card border border-line rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue/10 text-blue flex items-center justify-center rounded-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-xs text-ink">
                      Plano Arquitectónico y Cuadro de Cargas
                    </div>
                    <div className="text-[10px] font-mono text-faint">
                      plano_levantamiento_tienda.pdf (2.4 MB) · Verificado con Edge Function
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal font-semibold">Listo</span>
              </div>

              {mensaje && (
                <div
                  className={`p-3 rounded-xs border text-xs flex items-center gap-2 ${
                    mensaje.tipo === 'exito'
                      ? 'bg-[#E9F3F0] text-teal border-teal/40'
                      : 'bg-[#FBEAE5] text-rust border-rust/40'
                  }`}
                >
                  {mensaje.tipo === 'exito' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{mensaje.texto}</span>
                </div>
              )}

              <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-amber hover:bg-amber-hover text-ink font-bold px-6 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {guardando
                    ? 'Guardando especificaciones...'
                    : 'Finalizar Levantamiento (Avanzar a Paso 3)'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-faint">
              Seleccione una solicitud de la lista para registrar el levantamiento técnico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
