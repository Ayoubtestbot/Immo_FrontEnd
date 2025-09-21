import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { UserRole, TicketStatus, TicketPriority } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== UserRole.ADMIN) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          agency: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch ticket' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { subject, description, status, priority } = req.body;

      if (!subject || !description || !status || !priority) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: {
          subject,
          description,
          status,
          priority,
        },
      });
      res.status(200).json(updatedTicket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.ticket.delete({
        where: { id },
      });
      res.status(204).end(); // No content for successful deletion
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
