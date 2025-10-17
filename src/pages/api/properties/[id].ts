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

  if (req.method === 'PUT') {
    const { address, city, zipCode, country, type, price, status, description, projectId, etage, superficie, tranche, numAppartement } = req.body;

    if (!address || !city || !zipCode || !country || !type || price === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const property = await prisma.property.update({
        where: { id },
        data: {
          address,
          city,
          zipCode,
          country,
          type,
          price: parseFloat(price),
          status,
          description,
          etage,
          superficie,
          tranche,
          numAppartement,
          project: projectId ? { connect: { id: projectId } } : { disconnect: true },
        },
      });
      return res.status(200).json(property);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update property' });
    }
  } else if (req.method === 'DELETE') {
    if (session.user.role === 'AGENCY_MEMBER') {
      return res.status(403).json({ error: 'You do not have permission to delete this property' });
    }

    try {
      await prisma.property.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete property' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
