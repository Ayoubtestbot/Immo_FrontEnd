import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const sources = await prisma.source.findMany({
        where: {
          agencyId: session.user.agencyId,
        },
        orderBy: {
          name: 'asc',
        },
      });
      return res.status(200).json(sources);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch sources' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Source name is required' });
    }

    try {
      const newSource = await prisma.source.create({
        data: {
          name,
          agencyId: session.user.agencyId,
        },
      });
      return res.status(201).json(newSource);
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Source with this name already exists for your agency' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Failed to create source' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}