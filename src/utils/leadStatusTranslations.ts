import { LeadStatus } from '@prisma/client';

export const leadStatusTranslations: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'Nouveau',
  [LeadStatus.CONTACTED]: 'Contacté',
  [LeadStatus.QUALIFIED]: 'Qualifié',
  [LeadStatus.APPOINTMENT_SCHEDULED]: 'RV programmé',
  [LeadStatus.FOLLOW_UP]: 'À relancer',
  [LeadStatus.RELAUNCHED]: 'Relancé',
  [LeadStatus.NEGOTIATION]: 'Négociation',
  [LeadStatus.CONVERTED]: 'Converti',
  [LeadStatus.LOST]: 'Perdu',
  [LeadStatus.CONTRACT_SIGNED]: 'Contrat signé',
  [LeadStatus.CLOSED_WON]: 'Fermé Gagné',
  [LeadStatus.CLOSED_LOST]: 'Fermé Perdu',
  [LeadStatus.PENDING_DOCUMENTS]: 'En attente de document',
};

export const leadStatusColors: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-info', // Light blue
  [LeadStatus.CONTACTED]: 'bg-primary', // Blue
  [LeadStatus.QUALIFIED]: 'bg-success', // Green
  [LeadStatus.APPOINTMENT_SCHEDULED]: 'bg-warning', // Yellow
  [LeadStatus.FOLLOW_UP]: 'bg-secondary', // Gray
  [LeadStatus.RELAUNCHED]: 'bg-secondary', // Gray
  [LeadStatus.NEGOTIATION]: 'bg-dark', // Dark gray
  [LeadStatus.CONVERTED]: 'bg-success', // Green
  [LeadStatus.LOST]: 'bg-danger', // Red
  [LeadStatus.CONTRACT_SIGNED]: 'bg-success', // Green
  [LeadStatus.CLOSED_WON]: 'bg-success', // Green
  [LeadStatus.CLOSED_LOST]: 'bg-danger', // Red
  [LeadStatus.PENDING_DOCUMENTS]: 'bg-warning', // Yellow
};

export const getTranslatedLeadStatus = (status: LeadStatus): string => {
  return leadStatusTranslations[status] || status; // Fallback to English if not found
};