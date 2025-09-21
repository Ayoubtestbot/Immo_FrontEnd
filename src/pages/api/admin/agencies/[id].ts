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

  if (!session || session.user?.role !== UserRole.ADMIN) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agency ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const agency = await prisma.agency.findUnique({
        where: { id },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          },
          subscription: {
            include: { plan: true }
          }
        },
      });
      if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
      }
      res.status(200).json(agency);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch agency' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing required fields: name' });
      }

      const updatedAgency = await prisma.agency.update({
        where: { id },
        data: {
          name,
        },
      });
      res.status(200).json(updatedAgency);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update agency' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.agency.delete({
        where: { id },
      });
      res.status(204).end(); // No content for successful deletion
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete agency' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
