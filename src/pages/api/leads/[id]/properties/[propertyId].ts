import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, propertyId } = req.query;
  if (typeof id !== 'string' || typeof propertyId !== 'string') {
    return res.status(400).json({ error: 'Invalid lead or property ID' });
  }

  if (req.method === 'DELETE') {
    try {
      // Verify lead belongs to the user's agency
      const lead = await prisma.lead.findFirst({
        where: { id, agencyId: session.user.agencyId },
      });

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      // Unlink the property
      await prisma.lead.update({
        where: { id },
        data: {
          properties: {
            disconnect: { id: propertyId },
          },
        },
      });

      res.status(200).json({ message: 'Property unlinked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to unlink property' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
