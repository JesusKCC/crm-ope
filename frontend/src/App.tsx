import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SolicitudesProvider } from './contexts/SolicitudesContext';
import { Header } from './components/common/Header';
import { Sidebar, type VistaNavegacion } from './components/common/Sidebar';
import { PanelOperativo } from './components/operative/PanelOperativo';
import { PortalComercial } from './components/portals/PortalComercial';
import { PortalGerenteTienda } from './components/portals/PortalGerenteTienda';
import { PortalProveedor } from './components/portals/PortalProveedor';
import { ConsolaHITL } from './components/hitl/ConsolaHITL';
import { InspectorObraMultimodal } from './components/hitl/InspectorObraMultimodal';
import { DashboardAnalitico } from './components/analytics/DashboardAnalitico';
import { GestorFormatos } from './components/portals/GestorFormatos';

const MainAppContent: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<VistaNavegacion>('operativo');

  return (
    <div className="min-h-screen bg-paper font-sans text-ink flex flex-col">
      {/* Header Superior Corporativo con Switcher de 7 Roles */}
      <Header vistaActual={vistaActual} onCambiarVista={(v) => setVistaActual(v as VistaNavegacion)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Barra Lateral de Navegación */}
        <Sidebar vistaActual={vistaActual} alCambiarVista={setVistaActual} />

        {/* Área de Trabajo Principal */}
        <main className="flex-1 overflow-y-auto bg-paper">
          {vistaActual === 'operativo' && (
            <PanelOperativo alCrearSolicitud={() => setVistaActual('comercial')} />
          )}

          {vistaActual === 'comercial' && <PortalComercial />}

          {vistaActual === 'gerente_tienda' && <PortalGerenteTienda />}

          {vistaActual === 'proveedor' && <PortalProveedor />}

          {vistaActual === 'hitl_cotizaciones' && <ConsolaHITL />}

          {vistaActual === 'hitl_obra' && <InspectorObraMultimodal />}

          {vistaActual === 'analytics' && <DashboardAnalitico />}

          {vistaActual === 'formatos' && <GestorFormatos />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SolicitudesProvider>
        <MainAppContent />
      </SolicitudesProvider>
    </AuthProvider>
  );
}
