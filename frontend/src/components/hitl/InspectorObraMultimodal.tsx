import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { StateBadge } from '../common/StateBadge';
import type { HallazgoVision, ItemChecklistTecnico } from '../../types/crm.types';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Eye,
  Check,
  XCircle
} from 'lucide-react';

export const InspectorObraMultimodal: React.FC = () => {
  const { solicitudes, guardarDictamenObra } = useSolicitudes();

  // Solicitudes en Paso 7: OBRA_VALIDADA o con informes de obra
  const solicitudesPaso7 = solicitudes.filter(
    (s) => s.estado_flujo === '7_OBRA_VALIDADA' || (s.informes_obra && s.informes_obra.length > 0)
  );

  const [solicitudActiva, setSolicitudActiva] = useState(
    solicitudesPaso7[0] || solicitudes.find((s) => s.estado_flujo === '7_OBRA_VALIDADA') || solicitudes[0]
  );

  const informe = solicitudActiva?.informes_obra?.[0];
  const hallazgos: HallazgoVision[] = informe?.analisis_multimodal?.hallazgos_vision || [
    {
      id: 'hall-01',
      foto_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      elemento_evaluado: 'Tablero de Control Eléctrico Principal',
      estado_detectado: 'Conforme',
      confianza_score: 96.2,
      descripcion_ia: 'Rotulado de circuitos normado, llaves termomagnéticas y cableado peinado según norma CNE.',
      especificacion_requerida: 'Rotulado indeleble y cable libre de halógenos',
    },
    {
      id: 'hall-02',
      foto_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      elemento_evaluado: 'Rociadores de Red Contraincendios (ACI)',
      estado_detectado: 'Defecto_Leve',
      confianza_score: 84.0,
      descripcion_ia: 'Rociador ubicado a menos de 30cm del ducto de aire acondicionado, posible interferencia.',
      especificacion_requerida: 'Distancia mínima libre de 45cm según NFPA 13',
    },
    {
      id: 'hall-03',
      foto_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=800&auto=format&fit=crop&q=80',
      elemento_evaluado: 'Acabado de Pintura y Juntas Drywall',
      estado_detectado: 'Conforme',
      confianza_score: 91.5,
      descripcion_ia: 'Paredes con empaste uniforme, sin fisuras visibles ni burbujas en esquineros.',
      especificacion_requerida: 'Pintura Látex Lavable color blanco humo mate',
    },
  ];

  const [checklist, setChecklist] = useState<ItemChecklistTecnico[]>(
    informe?.analisis_multimodal?.checklist_tecnico || [
      {
        id: 'chk-01',
        item: 'Protocolo de medición de pozo a tierra (< 5 Ohmios)',
        categoria: 'Electrico',
        conforme_ia: true,
        evidencia_encontrada: 'Certificado firmado por Ing. Electricista colegiado (3.8 Ohm registrados).',
        dictamen_ingeniero: 'Aprobado',
      },
      {
        id: 'chk-02',
        item: 'Prueba hidrostática de tubería ACI a 200 PSI por 2 horas',
        categoria: 'Sanitario',
        conforme_ia: true,
        evidencia_encontrada: 'Manómetro marca 200 PSI constante sin caídas de presión.',
        dictamen_ingeniero: 'Aprobado',
      },
      {
        id: 'chk-03',
        item: 'Certificado de resistencia al fuego de tabiquería RF-60',
        categoria: 'Estructural',
        conforme_ia: false,
        evidencia_encontrada: 'Falta adjuntar la ficha técnica del fabricante de la placa de yeso.',
        dictamen_ingeniero: 'Pendiente',
        observacion: 'Contratista debe enviar la ficha técnica de Placa Cortafuego.',
      },
      {
        id: 'chk-04',
        item: 'Piso porcelanato antideslizante con coeficiente R11',
        categoria: 'Acabados',
        conforme_ia: true,
        evidencia_encontrada: 'Textura rugosa verificada visualmente en entrada y baños.',
        dictamen_ingeniero: 'Aprobado',
      },
    ]
  );

  const [fotoActiva, setFotoActiva] = useState<HallazgoVision>(hallazgos[0]);
  const [observacionesFinales, setObservacionesFinales] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const scoreCumplimiento = informe?.score_cumplimiento_ia || 88.0;

  const handleToggleChecklist = (id: string, dictamen: 'Aprobado' | 'Rechazado') => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, dictamen_ingeniero: dictamen } : c))
    );
  };

  const handleAprobarObra = async () => {
    if (!solicitudActiva || !informe) return;
    setGuardando(true);
    setMensaje(null);

    const res = await guardarDictamenObra(
      solicitudActiva.id,
      informe.id,
      'Aprobado',
      observacionesFinales || 'Obra validada con conformidad de ingeniería. Cumple estándares técnicos.'
    );

    setGuardando(false);
    if (res.exito) {
      setMensaje({ tipo: 'exito', texto: res.mensaje });
    } else {
      setMensaje({ tipo: 'error', texto: res.mensaje });
    }
  };

  const handleObservarObra = async () => {
    if (!solicitudActiva || !informe) return;
    setGuardando(true);
    setMensaje(null);

    const res = await guardarDictamenObra(
      solicitudActiva.id,
      informe.id,
      'Observado',
      observacionesFinales || 'Subsanar interferencia de rociador ACI y adjuntar certificado RF-60.'
    );

    setGuardando(false);
    if (res.exito) {
      setMensaje({ tipo: 'exito', texto: res.mensaje });
    } else {
      setMensaje({ tipo: 'error', texto: res.mensaje });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <Camera className="text-teal" size={26} />
            Inspector Multimodal de Fin de Obra (Visión por Computadora)
          </h1>
          <p className="text-sm text-faint mt-1">
            Paso 7: Detección visual de defectos en sitio, contraste contra especificaciones técnicas y dictamen de recepción final.
          </p>
        </div>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-sm border text-sm flex items-center gap-2 ${
            mensaje.tipo === 'exito'
              ? 'bg-[#E9F3F0] text-teal border-teal/40'
              : 'bg-[#FBEAE5] text-rust border-rust/40'
          }`}
        >
          {mensaje.tipo === 'exito' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector de Obras por Validar */}
        <div className="lg:col-span-1 bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col gap-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-faint border-b border-line pb-2">
            Obras en Validación ({solicitudesPaso7.length})
          </div>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {solicitudes.map((sol) => {
              const activo = solicitudActiva?.id === sol.id;
              const tieneInforme = sol.informes_obra && sol.informes_obra.length > 0;

              return (
                <button
                  key={sol.id}
                  onClick={() => {
                    setSolicitudActiva(sol);
                    setMensaje(null);
                  }}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    activo
                      ? 'border-teal bg-[#E9F3F0] ring-1 ring-teal'
                      : 'border-lineSoft bg-card hover:bg-rowHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-faint">{sol.codigo}</span>
                    <StateBadge estado={sol.estado_flujo} tamano="sm" />
                  </div>
                  <div className="font-medium text-xs text-ink line-clamp-1">{sol.titulo}</div>
                  <div className="text-[10px] font-mono text-muted mt-1">
                    {sol.locales?.nombre}
                  </div>
                  {tieneInforme && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-teal font-bold">
                      <ShieldCheck size={12} /> Score IA: {sol.informes_obra?.[0]?.score_cumplimiento_ia || 88}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visor Multimodal Central */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Tarjeta de Score General IA */}
          <div className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-faint">{solicitudActiva?.codigo}</div>
              <h2 className="text-lg font-display font-bold text-ink mt-0.5">
                {solicitudActiva?.titulo}
              </h2>
              <div className="text-xs text-muted font-mono mt-1">
                Contratista: <strong>{solicitudActiva?.contratistas?.nombre_empresa || 'Obras Express S.A.C.'}</strong>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-3 rounded-sm border border-lineSoft">
              <div className="text-right">
                <span className="block text-[10px] font-mono uppercase text-faint">
                  Conformidad Física Multimodal
                </span>
                <span className="text-2xl font-mono font-bold text-teal">
                  {scoreCumplimiento}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-teal flex items-center justify-center font-mono text-xs font-bold text-teal">
                88%
              </div>
            </div>
          </div>

          {/* Visor de Foto Activa con Análisis de Visión */}
          <div className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                <Eye size={16} className="text-teal" />
                Inspección Visual por Computadora ({hallazgos.length} evidencias analizadas)
              </h3>
              <span className="font-mono text-xs text-faint">
                {fotoActiva.elemento_evaluado}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Imagen Grande con Bounding Box Overlay */}
              <div className="relative rounded-sm overflow-hidden border border-line bg-black min-h-[260px] flex items-center justify-center">
                <img
                  src={fotoActiva.foto_url}
                  alt={fotoActiva.elemento_evaluado}
                  className="w-full h-full max-h-[340px] object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white p-2 rounded text-[11px] font-mono border border-white/20">
                  <div className="flex items-center gap-1.5 text-amber font-bold">
                    <AlertTriangle size={12} /> Detección AI Vision
                  </div>
                  <div>Confianza: {fotoActiva.confianza_score}%</div>
                </div>

                <div className="absolute bottom-3 right-3 bg-ink/90 text-white px-2.5 py-1 rounded text-xs font-mono">
                  Estado: <strong className={fotoActiva.estado_detectado === 'Conforme' ? 'text-teal' : 'text-amber'}>
                    {fotoActiva.estado_detectado}
                  </strong>
                </div>
              </div>

              {/* Detalle del Hallazgo */}
              <div className="p-4 bg-card border border-lineSoft rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-faint block mb-1">
                    Elemento Evaluado
                  </span>
                  <h4 className="font-display font-bold text-base text-ink mb-2">
                    {fotoActiva.elemento_evaluado}
                  </h4>

                  <div className="text-xs text-inkSoft leading-relaxed mb-4">
                    <strong>Diagnóstico IA:</strong> {fotoActiva.descripcion_ia}
                  </div>

                  <div className="p-3 bg-white border border-lineSoft rounded text-xs font-mono">
                    <span className="text-faint uppercase text-[10px] block mb-0.5">
                      Especificación de Referencia (Formato Maestro):
                    </span>
                    <span className="text-ink font-medium">
                      {fotoActiva.especificacion_requerida || 'Norma técnica vigente del centro comercial'}
                    </span>
                  </div>
                </div>

                {/* Miniaturas de Fotografías */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-lineSoft overflow-x-auto">
                  {hallazgos.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setFotoActiva(h)}
                      className={`w-16 h-16 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                        fotoActiva.id === h.id ? 'border-teal ring-2 ring-teal/40' : 'border-line opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={h.foto_url} alt={h.elemento_evaluado} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Técnico de Especificaciones */}
          <div className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col gap-3">
            <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2 border-b border-line pb-3">
              <FileCheck size={16} className="text-teal" />
              Checklist de Especificaciones Técnicas y Ensayos
            </h3>

            <div className="divide-y divide-lineSoft">
              {checklist.map((item) => (
                <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card border border-line text-faint uppercase">
                        {item.categoria}
                      </span>
                      <span className="font-medium text-xs text-ink">{item.item}</span>
                    </div>
                    <div className="text-[11px] text-faint font-mono mt-1">
                      Evidencia: {item.evidencia_encontrada}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleChecklist(item.id, 'Aprobado')}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                        item.dictamen_ingeniero === 'Aprobado'
                          ? 'bg-teal text-white'
                          : 'bg-card border border-line text-muted hover:bg-lineSoft'
                      }`}
                    >
                      <Check size={12} /> Aprobado
                    </button>
                    <button
                      onClick={() => handleToggleChecklist(item.id, 'Rechazado')}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                        item.dictamen_ingeniero === 'Rechazado'
                          ? 'bg-rust text-white'
                          : 'bg-card border border-line text-muted hover:bg-lineSoft'
                      }`}
                    >
                      <XCircle size={12} /> Observar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dictamen Final */}
            <div className="mt-3 pt-3 border-t border-lineSoft flex flex-col gap-2">
              <label className="font-mono text-[11px] uppercase tracking-wide text-faint">
                Observaciones del Inspector Colegiado (Acta de Conformidad)
              </label>
              <textarea
                value={observacionesFinales}
                onChange={(e) => setObservacionesFinales(e.target.value)}
                placeholder="Ingrese el dictamen final para el cierre del ticket o las correcciones exigidas..."
                rows={2}
                className="campo-input resize-none text-xs"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3">
              <button
                onClick={handleObservarObra}
                disabled={guardando}
                className="bg-card border border-rust text-rust hover:bg-[#FBEAE5] font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors"
              >
                Observar Obra (Exigir Subsanación en Sitio)
              </button>

              <button
                onClick={handleAprobarObra}
                disabled={guardando}
                className="bg-teal hover:bg-teal/90 text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm transition-colors flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 size={16} />
                Aprobar Conformidad de Obra (Cerrar y Archivar)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
