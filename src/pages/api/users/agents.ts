import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    try {
      const agents = await prisma.user.findMany({
        where: {
          agencyId: session.user.agencyId,
          role: {
            in: [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER, UserRole.AGENCY_SUPER_AGENT], // Filter by agent roles
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
      res.status(200).json(agents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
