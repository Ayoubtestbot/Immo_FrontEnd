import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { UserRole } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId || session.user.role !== UserRole.AGENCY_OWNER) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({ error: 'Missing currency' });
    }

    // Basic validation for currency format (e.g., 3 uppercase letters)
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: 'Invalid currency format' });
    }

    try {
      const updatedAgency = await prisma.agency.update({
        where: { id: session.user.agencyId },
        data: {
          currency,
        },
      });
      return res.status(200).json(updatedAgency);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update agency settings', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
