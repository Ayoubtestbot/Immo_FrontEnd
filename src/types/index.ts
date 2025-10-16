import type { Lead, User, Note, Activity, Property, Image as PrismaImage, Project } from '@prisma/client';

export interface LeadWithAssignedTo extends Lead {
  assignedTo: User | null;
  notes: (Note & { author: User })[];
  activities: Activity[];
  properties: Property[];
}

export interface PropertyWithDetails extends Property {
  images: PrismaImage[];
  leads: Lead[];
  project: Project | null;
  propertyNumber: number | null;
  etage: number | null;
  superficie: number | null;
  tranche: string | null;
  numAppartement: string | null;
}

export type Image = PrismaImage;