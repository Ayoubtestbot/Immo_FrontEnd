import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next'; // Correct import
import { authOptions } from '../../auth/[...nextauth]'; // Import authOptions
import { LeadStatus, ActivityType } from '@prisma/client';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations'; // New import

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions); // Correct usage
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid lead ID' });
  }

  if (req.method === 'PATCH') {
    try {
      const { status, assignedToId } = req.body;

      // First, verify the lead exists and belongs to the user's agency
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          agencyId: session.user.agencyId,
        },
      });

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      const activities = [];
      if (status && status !== lead.status) {
        console.log('Old status:', lead.status, 'Translated:', leadStatusTranslations[lead.status]);
        console.log('New status:', status, 'Translated:', leadStatusTranslations[status as LeadStatus]);
        activities.push(prisma.activity.create({
          data: {
            leadId: id,
            type: ActivityType.STATUS_CHANGE,
            details: `Statut changé de ${leadStatusTranslations[lead.status]} à ${leadStatusTranslations[status as LeadStatus]} `,
          },
        }));
      }

      if (assignedToId !== lead.assignedToId) {
        const oldAgent = lead.assignedToId ? (await prisma.user.findUnique({ where: { id: lead.assignedToId } }))?.name : 'personne';
        const newAgent = assignedToId ? (await prisma.user.findUnique({ where: { id: assignedToId } }))?.name : 'personne';
        activities.push(prisma.activity.create({
          data: {
            leadId: id,
            type: ActivityType.NOTE_ADDED, // Using NOTE_ADDED as a generic type for now
            details: `Prospect assigné à ${newAgent} par ${session.user.name}`,
          },
        }));
      }

      const updatedLead = prisma.lead.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(assignedToId !== undefined && { assignedToId }),
        },
      });

      await prisma.$transaction([...activities, updatedLead]);

      res.status(200).json(updatedLead);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}