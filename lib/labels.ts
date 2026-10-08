export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: 'Nuevo',
  contact_attempt: 'Intento de contacto',
  in_service: 'En atención',
  proposal_sent: 'Propuesta enviada',
  reserved: 'Apartado',
  sale_confirmed: 'Venta confirmada',
  lost: 'Perdido',
  cancelled: 'Cancelado',
};

/** Próximos estados válidos por estado (espelha o banco; o banco é a autoridade). */
export const LEAD_NEXT: Record<string, string[]> = {
  new: ['contact_attempt', 'in_service', 'lost'],
  contact_attempt: ['in_service', 'contact_attempt', 'lost'],
  in_service: ['proposal_sent', 'reserved', 'lost'],
  proposal_sent: ['in_service', 'reserved', 'lost'],
  reserved: ['cancelled', 'lost'],
  sale_confirmed: ['cancelled'],
  lost: ['in_service'],
  cancelled: [],
};

export const COMMISSION_STATUS_LABEL: Record<string, string> = {
  estimated: 'Estimada',
  awaiting_confirmation: 'Esperando confirmación',
  approved: 'Aprobada',
  scheduled: 'Programada para pago',
  paid: 'Pagada',
  cancelled: 'Cancelada',
  disputed: 'En disputa',
};

export const COMMISSION_NEXT: Record<string, string[]> = {
  estimated: ['awaiting_confirmation', 'cancelled'],
  awaiting_confirmation: ['approved', 'cancelled', 'disputed'],
  approved: ['scheduled', 'cancelled', 'disputed'],
  scheduled: ['paid', 'cancelled', 'disputed'],
  paid: ['disputed'],
  disputed: ['approved', 'cancelled'],
  cancelled: [],
};

export const ENVIAJADOR_STATUS_LABEL: Record<string, string> = { pending: 'Pendiente', active: 'Activo', suspended: 'Suspendido' };

const ERRORS: Record<string, string> = {
  invalid_transition: 'Ese cambio de estado no está permitido.',
  loss_reason_required: 'Indica el motivo de la pérdida.',
  reason_required: 'Indica el motivo.',
  forbidden: 'No tienes permiso para esta acción.',
  currency_mismatch: 'La moneda de la regla de comisión fija no coincide con la de la venta.',
  invalid_amount: 'El monto no es válido.',
  invalid_adjustment: 'El ajuste dejaría la comisión en negativo.',
  slug_taken: 'Ese enlace ya está en uso. Elige otro.',
  invalid_slug: 'El enlace debe tener 3 a 40 letras minúsculas, números o guiones.',
  invalid_name: 'Escribe tu nombre (2 a 80 caracteres).',
  user_not_found: 'No existe un usuario con ese correo. Debe registrarse primero.',
  use_confirm_sale: 'Para confirmar una venta usa el formulario de venta.',
};

export function friendlyError(message: string): string {
  const k = Object.keys(ERRORS).find((key) => message.includes(key));
  return k ? ERRORS[k]! : 'No se pudo completar la acción. Inténtalo de nuevo.';
}
