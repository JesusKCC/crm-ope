import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  anchoMaximo?: string;
}

export const Modal: React.FC<ModalProps> = ({
  abierto,
  onCerrar,
  titulo,
  subtitulo,
  children,
  anchoMaximo = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
      <div
        className={`bg-white border border-line shadow-2xl rounded-sm w-full ${anchoMaximo} max-h-[90vh] flex flex-col overflow-hidden animate-[scaleUp_0.15s_ease-out]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-card">
          <div>
            <h3 className="font-display font-bold text-ink text-base tracking-tight">{titulo}</h3>
            {subtitulo && <p className="text-xs text-faint font-mono mt-0.5">{subtitulo}</p>}
          </div>
          <button
            onClick={onCerrar}
            className="text-faint hover:text-ink p-1 rounded-sm hover:bg-lineSoft transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
