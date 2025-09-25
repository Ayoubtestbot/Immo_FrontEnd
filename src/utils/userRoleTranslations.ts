import { UserRole } from '@prisma/client';

export const userRoleTranslations: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.AGENCY_OWNER]: 'Manager',
  [UserRole.AGENCY_SUPER_AGENT]: 'Super Agent', // New translation
  [UserRole.AGENCY_MEMBER]: 'Agent',
};

export const getTranslatedUserRole = (role: UserRole): string => {
  return userRoleTranslations[role] || role; // Fallback to original role if not found
};