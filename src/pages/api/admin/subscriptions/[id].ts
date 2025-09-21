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
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          agency: { select: { id: true, name: true } },
          plan: { select: { id: true, name: true } },
        },
      });
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      res.status(200).json(subscription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { status, startDate, endDate, planId } = req.body;

      if (!status || !startDate || !planId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          plan: { connect: { id: planId } },
        },
      });
      res.status(200).json(updatedSubscription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.subscription.delete({
        where: { id },
      });
      res.status(204).end(); // No content for successful deletion
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete subscription' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
