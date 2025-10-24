import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          assignedTo: true,
          notes: {
            include: {
              author: true,
            },
          },
          activities: true,
          properties: true,
        },
      });

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      return res.status(200).json(lead);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch lead' });
    }
  } else if (req.method === 'DELETE') {
    if (session.user.role === 'AGENCY_MEMBER') {
      return res.status(403).json({ error: 'You do not have permission to delete this lead' });
    }

    try {
      await prisma.lead.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else if (req.method === 'PUT') { // Add PUT handler
    const { firstName, lastName, email, phone, sourceId, status, assignedToId, appointmentDate, isUrgent } = req.body;

    try {
      const dataToUpdate: Prisma.LeadUpdateInput = {};

      if (firstName !== undefined) dataToUpdate.firstName = firstName;
      if (lastName !== undefined) dataToUpdate.lastName = lastName;
      if (email !== undefined) dataToUpdate.email = email;
      if (phone !== undefined) dataToUpdate.phone = phone;
      if (status !== undefined) dataToUpdate.status = status;
      if (isUrgent !== undefined) dataToUpdate.isUrgent = isUrgent;
      if (appointmentDate !== undefined) dataToUpdate.appointmentDate = appointmentDate;

      if (sourceId !== undefined) {
        dataToUpdate.source = sourceId ? { connect: { id: sourceId } } : { disconnect: true };
      }
      if (assignedToId !== undefined) {
        dataToUpdate.assignedTo = assignedToId ? { connect: { id: assignedToId } } : { disconnect: true };
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: dataToUpdate,
      });
      return res.status(200).json(updatedLead);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Failed to update lead' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE', 'PUT']); // Allow PUT method
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
