import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { formatDate } from '../../utils/formatters';
import {
  BookOpen,
  Sparkles,
  Download,
  Plus,
  Code
} from 'lucide-react';

export const GestorFormatos: React.FC = () => {
  const { formatos } = useSolicitudes();
  const [formatoSeleccionado, setFormatoSeleccionado] = useState(formatos[0] || null);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <BookOpen className="text-blue" size={26} />
            Formatos Guía de Especialistas y Lineamientos RAG
          </h1>
          <p className="text-sm text-faint mt-1">
            Gestión de plantillas base de ingeniería vectorizadas con pgvector (1536 dim) para cotejo semántico de cotizaciones e inspección de obras.
          </p>
        </div>

        <button
          onClick={() => alert('Abriendo diálogo de carga de nueva plantilla especialista')}
          className="bg-blue hover:bg-blue-hover text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs flex items-center gap-2 shadow-xs"
        >
          <Plus size={14} /> Nueva Plantilla Base
        </button>
      </div>

      {/* Grid de Formatos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Formatos */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-faint border-b border-line pb-2">
            Formatos Maestros en Base de Datos ({formatos.length})
          </div>

          <div className="flex flex-col gap-2">
            {formatos.map((fmt) => {
              const seleccionado = formatoSeleccionado?.id === fmt.id;

              return (
                <button
                  key={fmt.id}
                  onClick={() => setFormatoSeleccionado(fmt)}
                  className={`p-4 rounded-sm border text-left transition-all flex flex-col gap-2 ${
                    seleccionado
                      ? 'border-blue bg-[#E2EAF1] ring-1 ring-blue'
                      : 'border-line bg-white hover:bg-rowHover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-blue border border-blue/20">
                      {fmt.tipo_formato}
                    </span>
                    <span className="text-[10px] font-mono text-faint">
                      {formatDate(fmt.created_at)}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-ink leading-tight">
                    {fmt.nombre}
                  </h3>

                  <p className="text-xs text-muted line-clamp-2">{fmt.descripcion}</p>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal font-semibold pt-2 border-t border-lineSoft">
                    <Sparkles size={12} /> Vector pgvector indexado
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle y Previsualización de la Plantilla */}
        <div className="lg:col-span-2 bg-white border border-line p-6 rounded-sm shadow-xs flex flex-col justify-between">
          {formatoSeleccionado ? (
            <div className="flex flex-col gap-5">
              <div className="border-b border-line pb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue font-bold px-2 py-0.5 rounded bg-blue/10">
                    {formatoSeleccionado.tipo_formato}
                  </span>
                  <h2 className="text-xl font-display font-bold text-ink mt-2">
                    {formatoSeleccionado.nombre}
                  </h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {formatoSeleccionado.descripcion}
                  </p>
                </div>

                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Descargando documento maestro: ${formatoSeleccionado.archivo_url}`);
                  }}
                  className="bg-card border border-line text-ink hover:bg-lineSoft font-mono text-xs font-bold uppercase px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
                >
                  <Download size={14} /> Descargar PDF
                </a>
              </div>

              {/* Parámetros Estructurados Extraídos */}
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-faint flex items-center gap-1.5 mb-2">
                  <Code size={14} className="text-blue" />
                  Lineamientos Estructurados de Cumplimiento Obligatorio
                </h4>

                <div className="p-4 bg-card border border-lineSoft rounded-sm text-xs font-mono">
                  <pre className="text-ink overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(formatoSeleccionado.contenido_estructurado, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Metadatos de Indexación RAG */}
              <div className="p-4 bg-[#E9F3F0] border border-teal/30 rounded-sm flex items-center justify-between text-xs font-mono text-teal">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  <span>
                    Embeddings HNSW Cosine Ops activos en <strong>public.formatos_especialista</strong>
                  </span>
                </div>
                <span>Dimensión: 1536</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-faint">
              Seleccione una plantilla de la lista para ver su estructura.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
