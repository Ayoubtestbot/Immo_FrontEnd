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

  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    try {
      const source = await prisma.source.findUnique({
        where: { id },
      });

      if (!source || source.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Source not found or unauthorized' });
      }

      return res.status(200).json(source);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch source' });
    }
  } else if (req.method === 'PUT') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Source name is required' });
    }

    try {
      const existingSource = await prisma.source.findUnique({
        where: { id },
      });

      if (!existingSource || existingSource.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Source not found or unauthorized' });
      }

      const updatedSource = await prisma.source.update({
        where: { id },
        data: { name },
      });
      return res.status(200).json(updatedSource);
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Source with this name already exists for your agency' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Failed to update source' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const existingSource = await prisma.source.findUnique({
        where: { id },
      });

      if (!existingSource || existingSource.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Source not found or unauthorized' });
      }

      await prisma.source.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete source' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}