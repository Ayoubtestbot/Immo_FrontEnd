import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { agencyId: true },
  });

  if (!user || !user.agencyId) {
    return res.status(403).json({ error: 'User is not associated with an agency' });
  }

  const agencyId = user.agencyId;

  if (req.method === 'GET') {
    try {
      const properties = await prisma.property.findMany({
        where: { agencyId: agencyId },
      });
      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  } else if (req.method === 'POST') {
    try {
      const { address, city, zipCode, country } = req.body;

      if (!address || !city || !zipCode || !country) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newProperty = await prisma.property.create({
        data: {
          address,
          city,
          zipCode,
          country,
          agency: {
            connect: { id: agencyId },
          },
        },
      });
      res.status(201).json(newProperty);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create property' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
