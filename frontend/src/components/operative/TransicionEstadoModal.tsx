import React, { useState } from 'react';
import type { SolicitudConRelaciones, EstadoFlujo } from '../../types/crm.types';
import { PASOS_FLUJO_CONFIG } from '../../types/crm.types';
import { useAuth } from '../../contexts/AuthContext';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import { Modal } from '../common/Modal';
import { StateBadge } from '../common/StateBadge';
import { obtenerTransicionesDisponibles } from '../../utils/stateTransitions';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface TransicionEstadoModalProps {
  solicitud: SolicitudConRelaciones | null;
  abierto: boolean;
  onCerrar: () => void;
}

export const TransicionEstadoModal: React.FC<TransicionEstadoModalProps> = ({
  solicitud,
  abierto,
  onCerrar,
}) => {
  const { rolActivo } = useAuth();
  const { transicionarEstado } = useSolicitudes();

  const [estadoDestino, setEstadoDestino] = useState<EstadoFlujo | null>(null);
  const [notaAuditoria, setNotaAuditoria] = useState('');
  const [ejecutando, setEjecutando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!solicitud) return null;

  const transicionesPosibles = obtenerTransicionesDisponibles(solicitud.estado_flujo, rolActivo);

  const handleEjecutarTransicion = async () => {
    if (!estadoDestino) {
      setErrorMsg('Debe seleccionar el estado de destino para continuar.');
      return;
    }

    setEjecutando(true);
    setErrorMsg(null);

    const res = await transicionarEstado(solicitud.id, estadoDestino, {
      notaAuditoria,
    });

    setEjecutando(false);
    if (res.exito) {
      onCerrar();
    } else {
      setErrorMsg(res.mensaje);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={`Transición de Estado · ${solicitud.codigo}`}
      subtitulo="Máquina de Estados de 7 Pasos · Validación de Precondiciones Técnicas"
      anchoMaximo="max-w-xl"
    >
      <div className="flex flex-col gap-5">
        {/* Origen vs Destino */}
        <div className="p-4 bg-card border border-line rounded-sm flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-faint block mb-1">Estado Actual</span>
            <StateBadge estado={solicitud.estado_flujo} />
          </div>

          <ArrowRight size={20} className="text-line flex-shrink-0" />

          <div>
            <span className="text-[10px] font-mono uppercase text-faint block mb-1">Estado Destino</span>
            {estadoDestino ? (
              <StateBadge estado={estadoDestino} />
            ) : (
              <span className="text-xs font-mono text-faint italic">Seleccione abajo...</span>
            )}
          </div>
        </div>

        {/* Transiciones Disponibles según Rol */}
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-2">
            Transiciones Autorizadas para tu Rol ({rolActivo})
          </label>

          {transicionesPosibles.length === 0 ? (
            <div className="p-4 bg-[#FBEAE5] border border-rust text-rust text-xs rounded-sm flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                No existen transiciones configuradas para tu rol actual en el estado <strong>{solicitud.estado_flujo}</strong>. Contacta al Ingeniero o Administrador.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {transicionesPosibles.map((t) => {
                const cfgDestino = PASOS_FLUJO_CONFIG[t.destino];
                const seleccionada = estadoDestino === t.destino;

                return (
                  <button
                    key={t.destino}
                    type="button"
                    onClick={() => {
                      setEstadoDestino(t.destino);
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-sm border text-left transition-all flex items-start gap-3 ${
                      seleccionada
                        ? 'border-navy bg-navy text-navyText shadow-xs'
                        : 'border-lineSoft bg-white hover:bg-rowHover text-ink'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mt-0.5 flex-shrink-0 ${
                        seleccionada ? 'bg-amber text-ink' : 'bg-line text-faint'
                      }`}
                    >
                      {cfgDestino.paso}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs leading-tight">
                        {cfgDestino.titulo}
                      </div>
                      <div
                        className={`text-[11px] mt-1 leading-snug ${
                          seleccionada ? 'text-navySoft' : 'text-muted'
                        }`}
                      >
                        {t.descripcion}
                      </div>
                      <div
                        className={`text-[10px] font-mono mt-1 ${
                          seleccionada ? 'text-amber' : 'text-faint'
                        }`}
                      >
                        Requerimiento: {cfgDestino.entregableRequerido}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Nota de Auditoría */}
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wide text-faint mb-1">
            Justificación / Motivo del Cambio (Auditoría Inmutable)
          </label>
          <textarea
            value={notaAuditoria}
            onChange={(e) => setNotaAuditoria(e.target.value)}
            placeholder="Ingrese comentarios o referencias técnicas del avance..."
            rows={2}
            className="campo-input resize-none text-xs"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FBEAE5] border border-rust text-rust text-xs rounded-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 text-xs font-mono text-muted hover:text-ink transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleEjecutarTransicion}
            disabled={!estadoDestino || ejecutando || transicionesPosibles.length === 0}
            className="bg-navy hover:bg-[#25394E] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-all disabled:opacity-50"
          >
            {ejecutando ? 'Transicionando en DB...' : 'Confirmar Transición'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
