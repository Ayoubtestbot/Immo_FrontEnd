
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { leadIds } = req.body;

      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: 'No lead IDs provided.' });
      }

      const leadsToDelete = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          agencyId: session.user.agencyId,
        },
      });

      if (leadsToDelete.length !== leadIds.length) {
        return res.status(404).json({ error: 'Some leads not found or access denied.' });
      }

      const deletedLeads = await prisma.lead.deleteMany({
        where: {
          id: { in: leadIds },
          agencyId: session.user.agencyId,
        },
      });

      res.status(200).json({ count: deletedLeads.count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to perform bulk delete on leads' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
