import { PropertyStatus } from '@prisma/client';

export const propertyStatusTranslations: { [key in PropertyStatus]: string } = {
  A_VENDRE: 'À vendre',
  VENDU: 'Vendu',
  EN_LOCATION: 'En location',
  LOUE: 'Loué',
};
