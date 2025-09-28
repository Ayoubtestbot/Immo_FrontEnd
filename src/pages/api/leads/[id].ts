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

  if (req.method === 'DELETE') {
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
    const { isUrgent } = req.body;

    if (typeof isUrgent !== 'boolean') {
      return res.status(400).json({ error: 'Invalid isUrgent value' });
    }

    try {
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: { isUrgent },
      });
      return res.status(200).json(updatedLead);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update lead urgency' });
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT']); // Allow PUT method
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
