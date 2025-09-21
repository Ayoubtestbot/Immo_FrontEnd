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
    return res.status(400).json({ error: 'Plan ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id },
      });
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      res.status(200).json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch plan' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, price, prospectsLimit, features } = req.body;

      if (!name || price === undefined || prospectsLimit === undefined || !features) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updatedPlan = await prisma.plan.update({
        where: { id },
        data: {
          name,
          price: parseFloat(price),
          prospectsLimit: parseInt(prospectsLimit),
          features,
        },
      });
      res.status(200).json(updatedPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update plan' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.plan.delete({
        where: { id },
      });
      res.status(204).end(); // No content for successful deletion
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete plan' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
