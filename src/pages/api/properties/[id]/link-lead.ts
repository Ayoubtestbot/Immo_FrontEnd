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
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'Missing leadId' });
    }

    try {
      await prisma.property.update({
        where: {
          id,
        },
        data: {
          leads: {
            connect: {
              id: leadId,
            },
          },
        },
      });
      return res.status(200).json({ message: 'Lead linked successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to link lead' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
