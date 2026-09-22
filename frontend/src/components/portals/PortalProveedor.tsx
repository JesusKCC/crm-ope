import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { useAuth } from '../../contexts/AuthContext';
import { StateBadge } from '../common/StateBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatDate } from '../../utils/formatters';
import {
  Briefcase,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send
} from 'lucide-react';

export const PortalProveedor: React.FC = () => {
  const { solicitudes, subirCotizacionProveedor, transicionarEstado } = useSolicitudes();
  const { profile } = useAuth();

  const [pestana, setPestana] = useState<'licitaciones' | 'obras_activas'>('licitaciones');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<string | null>(null);
  const [montoCotizado, setMontoCotizado] = useState<string>('48500');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  // Solicitudes en licitación abierta (Paso 4)
  const licitacionesAbiertas = solicitudes.filter((s) => s.estado_flujo === '4_EN_LICITACION');

  // Obras adjudicadas y en marcha (Paso 6) o en validación (Paso 7)
  const obrasEnMarcha = solicitudes.filter(
    (s) => s.estado_flujo === '6_COTIZACION_APROBADA' || s.estado_flujo === '7_OBRA_VALIDADA'
  );

  const handleSubirPropuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudSeleccionada) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione una licitación activa.' });
      return;
    }

    setSubiendo(true);
    setNotificacion(null);

    const file = archivoSeleccionado || new File(['mock pdf content'], 'propuesta_economica.pdf', { type: 'application/pdf' });

    const res = await subirCotizacionProveedor(solicitudSeleccionada, file, {
      montoTotal: parseFloat(montoCotizado) || 48500,
      contratistaId: profile?.contratista_id || 'cont-001',
    });

    setSubiendo(false);
    if (res.exito) {
      setNotificacion({ tipo: 'exito', mensaje: res.mensaje });
      setSolicitudSeleccionada(null);
      setArchivoSeleccionado(null);
    } else {
      setNotificacion({ tipo: 'error', mensaje: res.mensaje });
    }
  };

  const handleEntregarObra = async (solicitudId: string) => {
    setSubiendo(true);
    setNotificacion(null);

    const res = await transicionarEstado(solicitudId, '7_OBRA_VALIDADA', {
      notaAuditoria: 'Proveedor entregó informe final de obra y fotografías para auditoría multimodal.',
    });

    setSubiendo(false);
    if (res.exito) {
      setNotificacion({ tipo: 'exito', mensaje: 'Informe de obra remitido a Ingeniería para validación multimodal (Paso 7).' });
    } else {
      setNotificacion({ tipo: 'error', mensaje: res.mensaje });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
          <Briefcase className="text-blue" size={26} />
          Portal de Contratistas y Proveedores
        </h1>
        <p className="text-sm text-faint mt-1">
          Postulación a licitaciones técnicas (Paso 4) y entrega de informes fotográficos de fin de obra (Paso 7).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          onClick={() => setPestana('licitaciones')}
          className={`font-mono text-xs uppercase tracking-wider px-4 py-2 border-b-2 transition-all ${
            pestana === 'licitaciones'
              ? 'border-blue text-blue font-bold'
              : 'border-transparent text-faint hover:text-ink'
          }`}
        >
          Licitaciones Abiertas ({licitacionesAbiertas.length})
        </button>
        <button
          onClick={() => setPestana('obras_activas')}
          className={`font-mono text-xs uppercase tracking-wider px-4 py-2 border-b-2 transition-all ${
            pestana === 'obras_activas'
              ? 'border-blue text-blue font-bold'
              : 'border-transparent text-faint hover:text-ink'
          }`}
        >
          Obras Adjudicadas y Entregas ({obrasEnMarcha.length})
        </button>
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

      {pestana === 'licitaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Licitaciones */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {licitacionesAbiertas.length === 0 ? (
              <div className="p-12 text-center bg-white border border-line text-faint text-sm">
                No hay licitaciones abiertas para postular en este momento.
              </div>
            ) : (
              licitacionesAbiertas.map((lic) => {
                const seleccionada = solicitudSeleccionada === lic.id;

                return (
                  <div
                    key={lic.id}
                    className={`bg-white border p-5 rounded-sm shadow-xs flex flex-col justify-between transition-all ${
                      seleccionada ? 'border-blue ring-1 ring-blue' : 'border-line hover:border-line'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-faint">{lic.codigo}</span>
                          <PriorityBadge prioridad={lic.prioridad} />
                        </div>
                        <h3 className="font-display font-bold text-base text-ink mt-1">
                          {lic.titulo}
                        </h3>
                      </div>
                      <StateBadge estado={lic.estado_flujo} />
                    </div>

                    <p className="text-xs text-muted leading-relaxed mb-4">{lic.descripcion}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-card border border-lineSoft rounded-sm text-xs font-mono mb-4">
                      <div>
                        <span className="text-faint uppercase text-[10px] block">Local</span>
                        <span className="font-semibold text-ink">{lic.locales?.nombre}</span>
                      </div>
                      <div>
                        <span className="text-faint uppercase text-[10px] block">Área Intervenida</span>
                        <span className="font-semibold text-ink">
                          {lic.especificaciones_tecnicas?.medidas_exactas_m2 || 120} m²
                        </span>
                      </div>
                      <div>
                        <span className="text-faint uppercase text-[10px] block">Fecha Límite</span>
                        <span className="font-semibold text-ink">{formatDate(lic.fecha_limite)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-lineSoft">
                      <a
                        href="#plano"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Descargando pliego técnico y planos: plano_arquitectura_sol.pdf');
                        }}
                        className="text-xs text-blue font-semibold hover:underline flex items-center gap-1.5"
                      >
                        <FileText size={14} /> Descargar Pliego y Planos (PDF)
                      </a>

                      <button
                        onClick={() => setSolicitudSeleccionada(lic.id)}
                        className={`text-xs font-mono uppercase tracking-wider px-4 py-2 font-bold transition-colors ${
                          seleccionada
                            ? 'bg-blue text-white'
                            : 'bg-card border border-line text-ink hover:bg-lineSoft'
                        }`}
                      >
                        {seleccionada ? 'Seleccionada' : 'Postular / Cotizar'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulario de Carga de Propuesta en PDF */}
          <div className="lg:col-span-1 bg-white border border-line p-5 rounded-sm shadow-xs h-fit">
            <h2 className="font-display font-semibold text-ink text-base border-b border-line pb-3 mb-4 flex items-center gap-2">
              <Upload className="text-blue" size={18} />
              Enviar Propuesta Técnica / Económica
            </h2>

            {solicitudSeleccionada ? (
              <form onSubmit={handleSubirPropuesta} className="flex flex-col gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                    Monto Total Cotizado (S/ con IGV) *
                  </label>
                  <input
                    type="number"
                    value={montoCotizado}
                    onChange={(e) => setMontoCotizado(e.target.value)}
                    min="1"
                    step="100"
                    className="campo-input font-mono text-base font-bold text-ink"
                    required
                  />
                  <span className="text-[10px] text-faint font-mono">
                    Sujeto a validación RAG vs precios de referencia
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
                    Archivo de Cotización (PDF) *
                  </label>
                  <div className="border-2 border-dashed border-line rounded-sm p-4 text-center bg-card hover:bg-rowHover transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setArchivoSeleccionado(e.target.files[0]);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <FileText size={28} className="mx-auto text-faint mb-2" />
                    <div className="text-xs font-semibold text-ink">
                      {archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic o arrastra tu archivo PDF'}
                    </div>
                    <div className="text-[10px] font-mono text-faint mt-1">
                      Máximo 10 MB · Validado por Edge Function con Magic Bytes
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={subiendo}
                  className="w-full bg-blue hover:bg-blue-hover text-white font-bold py-2.5 px-4 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {subiendo ? 'Procesando con RAG IA...' : 'Enviar Cotización a Evaluación (Paso 5)'}
                </button>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-faint bg-card border border-lineSoft rounded-sm">
                Selecciona una licitación de la lista para cargar tu propuesta económica.
              </div>
            )}
          </div>
        </div>
      )}

      {pestana === 'obras_activas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {obrasEnMarcha.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white border border-line text-faint text-sm">
              No tienes obras adjudicadas en ejecución en este momento.
            </div>
          ) : (
            obrasEnMarcha.map((obra) => {
              const estaEnValidacion = obra.estado_flujo === '7_OBRA_VALIDADA';

              return (
                <div key={obra.id} className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-xs text-faint">{obra.codigo}</span>
                        <h3 className="font-display font-bold text-base text-ink mt-0.5">
                          {obra.titulo}
                        </h3>
                      </div>
                      <StateBadge estado={obra.estado_flujo} />
                    </div>

                    <p className="text-xs text-muted mb-4">{obra.descripcion}</p>
                  </div>

                  <div className="pt-4 border-t border-lineSoft flex items-center justify-between">
                    {estaEnValidacion ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-teal font-semibold">
                        <CheckCircle2 size={16} /> En proceso de validación multimodal por Ingeniería
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEntregarObra(obra.id)}
                        disabled={subiendo}
                        className="bg-teal hover:bg-teal/90 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
                      >
                        <FileCheck size={14} />
                        Entregar Informe Final y Fotos (Paso 7)
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
