import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user.role !== UserRole.AGENCY_OWNER && session.user.role !== UserRole.AGENCY_MEMBER && session.user.role !== UserRole.AGENCY_SUPER_AGENT)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { subject, description, priority, category } = req.body;

    if (!subject || !description || !priority || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!session.user.agencyId) {
        return res.status(400).json({ error: 'User is not associated with an agency' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
        category,
        agencyId: session.user.agencyId,
        userId: session.user.id,
      },
    });

    return res.status(201).json(ticket);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
