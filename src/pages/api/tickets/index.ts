import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { withApiAuth } from '@/lib/withApiAuth';
import { Session } from 'next-auth';

async function handler(req: NextApiRequest, res: NextApiResponse, session: Session) {
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

export default withApiAuth(handler, [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER, UserRole.AGENCY_SUPER_AGENT]);
