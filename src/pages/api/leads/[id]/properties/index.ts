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

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid lead ID' });
  }

  if (req.method === 'POST') {
    try {
      const { propertyId } = req.body;
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      // Verify lead and property belong to the same agency
      const lead = await prisma.lead.findFirst({
        where: { id, agencyId: session.user.agencyId },
      });
      const property = await prisma.property.findFirst({
        where: { id: propertyId, agencyId: session.user.agencyId },
      });

      if (!lead || !property) {
        return res.status(404).json({ error: 'Lead or Property not found or access denied' });
      }

      // Link the property
      await prisma.lead.update({
        where: { id },
        data: {
          properties: {
            connect: { id: propertyId },
          },
        },
      });

      res.status(200).json({ message: 'Property linked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to link property' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
