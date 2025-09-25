import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const { ticketId } = req.query;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId as string },
    include: { agency: true },
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Admins can see all messages, agency users can only see messages on their own tickets
  if (session.user.role !== UserRole.ADMIN && session.user.agencyId !== ticket.agencyId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: ticketId as string },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(messages);
  } else if (req.method === 'POST') {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        content,
        ticketId: ticketId as string,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    return res.status(201).json(message);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
