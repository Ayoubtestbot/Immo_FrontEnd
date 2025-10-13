import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    try {
      const tickets = await prisma.ticket.findMany({
        include: {
          agency: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  } else if (req.method === 'POST') {
    try {
      const { subject, description, agencyId, userId, status, priority } = req.body;

      if (!subject || !description || !agencyId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newTicket = await prisma.ticket.create({
        data: {
          subject,
          description,
          agency: { connect: { id: agencyId } },
          user: { connect: { id: userId } },
          status: status || TicketStatus.NEW,
          priority: priority || TicketPriority.MEDIUM,
        },
      });
      res.status(201).json(newTicket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
