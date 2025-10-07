import type { Lead, User, Note, Activity, Property, Image as PrismaImage } from '@prisma/client';

export interface LeadWithAssignedTo extends Lead {
  assignedTo: User | null;
  notes: (Note & { author: User })[];
  activities: Activity[];
  properties: Property[];
}

export interface PropertyWithDetails extends Property {
  images: PrismaImage[];
  leads: Lead[];
  propertyNumber: number | null;
}

export type Image = PrismaImage;