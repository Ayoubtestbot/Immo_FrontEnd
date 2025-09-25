import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id } = req.query as { id: string };
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'Missing propertyId' });
    }

    try {
      await prisma.lead.update({
        where: {
          id,
        },
        data: {
          properties: {
            connect: {
              id: propertyId,
            },
          },
        },
      });
      return res.status(200).json({ message: 'Property linked successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to link property' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
