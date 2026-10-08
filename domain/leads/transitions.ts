export const LEAD_STATUSES = [
  'new',
  'contact_attempt',
  'in_service',
  'proposal_sent',
  'reserved',
  'sale_confirmed',
  'lost',
  'cancelled',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const T: Record<LeadStatus, LeadStatus[]> = {
  new: ['contact_attempt', 'in_service', 'lost'],
  contact_attempt: ['in_service', 'contact_attempt', 'lost'],
  in_service: ['proposal_sent', 'reserved', 'lost'],
  proposal_sent: ['in_service', 'reserved', 'lost'],
  reserved: ['sale_confirmed', 'cancelled', 'lost'],
  sale_confirmed: ['cancelled'],
  lost: ['in_service'], // reabertura
  cancelled: [],
};

export const canTransition = (from: LeadStatus, to: LeadStatus): boolean => T[from].includes(to);

/** Perda exige motivo (regra do CRM). */
export function validateTransition(from: LeadStatus, to: LeadStatus, lossReason?: string): string | null {
  if (!canTransition(from, to)) return `Transição não permitida: ${from} → ${to}`;
  if (to === 'lost' && !lossReason?.trim()) return 'Motivo de perda obrigatório';
  return null;
}
