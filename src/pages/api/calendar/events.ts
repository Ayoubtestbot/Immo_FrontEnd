import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    try {
      const { start, end } = req.query; // start and end are ISO date strings

      if (!start || !end) {
        return res.status(400).json({ error: 'Missing start or end date parameters.' });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const events = await prisma.lead.findMany({
        where: {
          agencyId: session.user.agencyId,
          status: LeadStatus.APPOINTMENT_SCHEDULED,
          appointmentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true, // Added
          phone: true, // Added
          createdAt: true, // Added
          city: true, // Added
          appointmentDate: true,
          assignedTo: {
            select: {
              name: true,
            },
          },
          notes: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          activities: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          properties: true, // Added
        },
      });

      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
