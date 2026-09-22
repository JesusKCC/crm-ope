import type { EstadoFlujo, RolUsuario, SolicitudConRelaciones } from '../types/crm.types';

export interface ReglaTransicion {
  origen: EstadoFlujo;
  destino: EstadoFlujo;
  rolesPermitidos: RolUsuario[];
  descripcion: string;
  requiereConfirmacion: boolean;
  validadorPrecondicion?: (solicitud: SolicitudConRelaciones) => { valida: boolean; motivo?: string };
}

export const TRANSICIONES_VALIDAS: ReglaTransicion[] = [
  {
    origen: '1_NUEVO_REQUERIMIENTO',
    destino: '2_ESPERANDO_INFO_LOCAL',
    rolesPermitidos: ['ingeniero', 'admin'],
    descripcion: 'Ingeniería revisa el requerimiento y solicita formalmente levantamiento técnico en sitio al Gerente de Tienda.',
    requiereConfirmacion: true,
  },
  {
    origen: '2_ESPERANDO_INFO_LOCAL',
    destino: '3_LEVANTAMIENTO_COMPLETO',
    rolesPermitidos: ['gerente_tienda', 'admin'],
    descripcion: 'Gerente de Tienda remite las especificaciones técnicas (m2, kW, PSI, fotos y planos).',
    requiereConfirmacion: true,
    validadorPrecondicion: (solicitud) => {
      if (!solicitud.especificaciones_tecnicas) {
        return { valida: false, motivo: 'Debe ingresar las medidas exactas, potencia eléctrica y presión de agua.' };
      }
      return { valida: true };
    },
  },
  {
    origen: '3_LEVANTAMIENTO_COMPLETO',
    destino: '4_EN_LICITACION',
    rolesPermitidos: ['ingeniero', 'admin'],
    descripcion: 'Ingeniería aprueba especificaciones técnicas y abre la licitación pública a contratistas.',
    requiereConfirmacion: true,
  },
  {
    origen: '4_EN_LICITACION',
    destino: '5_EVALUANDO_COTIZACIONES',
    rolesPermitidos: ['proveedor', 'admin'],
    descripcion: 'El contratista sube su propuesta económica/técnica en PDF e inicia la evaluación con IA.',
    requiereConfirmacion: false,
    validadorPrecondicion: (solicitud) => {
      const tieneCotizacion = solicitud.cotizaciones && solicitud.cotizaciones.length > 0;
      if (!tieneCotizacion) {
        return { valida: false, motivo: 'Debe adjuntar al menos una propuesta de cotización en PDF.' };
      }
      return { valida: true };
    },
  },
  {
    origen: '5_EVALUANDO_COTIZACIONES',
    destino: '6_COTIZACION_APROBADA',
    rolesPermitidos: ['ingeniero', 'supervisor', 'admin'],
    descripcion: 'Ingeniería/Supervisión adjudica formalmente la propuesta ganadora y autoriza orden de trabajo en ERP.',
    requiereConfirmacion: true,
  },
  {
    origen: '5_EVALUANDO_COTIZACIONES',
    destino: '4_EN_LICITACION',
    rolesPermitidos: ['ingeniero', 'admin'],
    descripcion: 'Rechazar propuestas y reabrir licitación para recibir nuevas ofertas de proveedores.',
    requiereConfirmacion: true,
  },
  {
    origen: '6_COTIZACION_APROBADA',
    destino: '7_OBRA_VALIDADA',
    rolesPermitidos: ['proveedor', 'admin'],
    descripcion: 'El contratista culmina los trabajos y remite el informe técnico de finalización con fotos.',
    requiereConfirmacion: true,
  },
  {
    origen: '7_OBRA_VALIDADA',
    destino: 'CERRADO',
    rolesPermitidos: ['ingeniero', 'supervisor', 'admin'],
    descripcion: 'Ingeniería valida la conformidad física mediante análisis multimodal y emite acta de cierre.',
    requiereConfirmacion: true,
  },
];

export function obtenerTransicionesDisponibles(
  estadoActual: EstadoFlujo,
  rolUsuario: RolUsuario
): ReglaTransicion[] {
  return TRANSICIONES_VALIDAS.filter(
    (t) => t.origen === estadoActual && (t.rolesPermitidos.includes(rolUsuario) || rolUsuario === 'admin')
  );
}

export function validarTransicion(
  estadoOrigen: EstadoFlujo,
  estadoDestino: EstadoFlujo,
  rolUsuario: RolUsuario,
  solicitud: SolicitudConRelaciones
): { permitida: boolean; mensajeError?: string } {
  const regla = TRANSICIONES_VALIDAS.find(
    (t) => t.origen === estadoOrigen && t.destino === estadoDestino
  );

  if (!regla) {
    return { permitida: false, mensajeError: `Transición no permitida de ${estadoOrigen} a ${estadoDestino}.` };
  }

  const rolAutorizado = regla.rolesPermitidos.includes(rolUsuario) || rolUsuario === 'admin';
  if (!rolAutorizado) {
    return {
      permitida: false,
      mensajeError: `Tu rol actual (${rolUsuario}) no tiene permisos para ejecutar esta acción.`,
    };
  }

  if (regla.validadorPrecondicion) {
    const precond = regla.validadorPrecondicion(solicitud);
    if (!precond.valida) {
      return { permitida: false, mensajeError: precond.motivo || 'No se cumplen las precondiciones técnicas.' };
    }
  }

  return { permitida: true };
}
