import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { LeadStatus, ActivityType, Prisma } from '@prisma/client';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations';
import { sendSms } from '@/lib/brevo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!session.user.role) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'PATCH') {
    try {
      const { leadIds, status, assignedToId } = req.body;

      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: 'No lead IDs provided.' });
      }

      const updateData: Prisma.LeadUpdateInput = {};
      const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];

      if (status) {
        updateData.status = status;
      }
      if (assignedToId) {
        updateData.assignedTo = { connect: { id: assignedToId } };
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided.' });
      }

      // Fetch leads to get current status and assigned agent for activity logging and SMS
      const leadsToUpdate = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          agencyId: session.user.agencyId,
        },
        include: {
          assignedTo: true, // Include assigned agent for SMS
        },
      });

      if (leadsToUpdate.length === 0) {
        return res.status(404).json({ error: 'No leads found or access denied for provided IDs.' });
      }

      // Create a single notification for the bulk assignment
      if (assignedToId) {
        const leadsBeingReassigned = leadsToUpdate.filter(lead => lead.assignedToId !== assignedToId);
        if (leadsBeingReassigned.length > 0) {
            await prisma.notification.create({
                data: {
                    recipientId: assignedToId,
                    message: `Vous avez été assigné à ${leadsBeingReassigned.length} nouveaux prospects.`,
                    link: `/agency/leads`
                }
            });
        }
      }

      const updateOperations = leadsToUpdate.map(async (lead) => {
        const individualUpdateData: Prisma.LeadUpdateInput = {};

        // Handle status change activity
        if (status && lead.status !== status) {
          activitiesToCreate.push({
            leadId: lead.id,
            type: ActivityType.STATUS_CHANGE,
            details: `Statut changé de ${leadStatusTranslations[lead.status]} à ${leadStatusTranslations[status as LeadStatus]} (action groupée)`,
          });
          individualUpdateData.status = status;
        }

        // Handle assigned agent change activity and SMS
        if (assignedToId && lead.assignedToId !== assignedToId) {
          const newAgent = await prisma.user.findUnique({ where: { id: assignedToId } });
          if (newAgent) {
            activitiesToCreate.push({
              leadId: lead.id,
              type: ActivityType.NOTE_ADDED, // Using NOTE_ADDED for now
              details: `Prospect assigné à ${newAgent.name} par ${session.user.name} (action groupée)`,
            });
            individualUpdateData.assignedTo = { connect: { id: assignedToId } };

            // Send SMS to the lead with the new agent's info
            await sendSms(lead, newAgent);
          }
        }

        return prisma.lead.update({
          where: { id: lead.id },
          data: individualUpdateData,
        });
      });

      // Execute all updates and activity creations in a transaction
      const updatedLeads = await Promise.all(updateOperations);

      if (activitiesToCreate.length > 0) {
        await prisma.activity.createMany({
          data: activitiesToCreate,
        });
      }

      res.status(200).json({ count: updatedLeads.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to perform bulk update on leads' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
