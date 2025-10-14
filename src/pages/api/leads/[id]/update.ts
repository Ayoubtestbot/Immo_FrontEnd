import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next'; // Correct import
import { authOptions } from '../../auth/[...nextauth]'; // Import authOptions
import { sendSms } from '@/lib/brevo';
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
      const { status, assignedToId, appointmentDate } = req.body; // Destructure appointmentDate

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
      const notifications = [];
      const updateData: Prisma.LeadUpdateInput = {};

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
        updateData.status = status;
      }

      if (assignedToId && assignedToId !== lead.assignedToId) {
        const newAgent = await prisma.user.findUnique({ where: { id: assignedToId } });
        if (newAgent) {
          activities.push(prisma.activity.create({
            data: {
              leadId: id,
              type: ActivityType.NOTE_ADDED, // Using NOTE_ADDED as a generic type for now
              details: `Prospect assigné à ${newAgent.name} par ${session.user.name}`,
            },
          }));

          notifications.push(prisma.notification.create({
            data: {
                recipientId: newAgent.id,
                message: `Vous avez été assigné à un nouveau prospect : ${lead.firstName} ${lead.lastName}`,
                link: `/agency/leads?leadId=${lead.id}`
            }
          }));

          // Send SMS to the lead with the new agent's info
          await sendSms(lead, newAgent);
        }
        updateData.assignedTo = { connect: { id: assignedToId } };
      }

      // Handle appointmentDate
      if (status === LeadStatus.APPOINTMENT_SCHEDULED && appointmentDate) {
        const newAppointmentDate = new Date(appointmentDate);
        if (lead.appointmentDate?.toISOString() !== newAppointmentDate.toISOString()) {
          activities.push(prisma.activity.create({
            data: {
              leadId: id,
              type: ActivityType.NOTE_ADDED, // Consider a more specific ActivityType if available
              details: `Rendez-vous programmé pour le ${newAppointmentDate.toLocaleDateString()}`,
            },
          }));
          updateData.appointmentDate = newAppointmentDate;
        }
      } else if (status !== LeadStatus.APPOINTMENT_SCHEDULED && lead.appointmentDate) {
        // If status changes from APPOINTMENT_SCHEDULED, clear the date
        updateData.appointmentDate = null;
      }

      const updatedLead = prisma.lead.update({
        where: { id },
        data: updateData,
      });

      await prisma.$transaction([...activities, ...notifications, updatedLead]);

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