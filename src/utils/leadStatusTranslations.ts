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
};

export const getTranslatedLeadStatus = (status: LeadStatus): string => {
  return leadStatusTranslations[status] || status; // Fallback to English if not found
};