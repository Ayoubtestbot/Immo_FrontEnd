import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    try {
      const subscriptions = await prisma.subscription.findMany({
        include: {
          agency: { select: { id: true, name: true } },
          plan: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(subscriptions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { agencyId, planId, status, startDate, endDate } = req.body;

      if (!agencyId || !planId || !status || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if agency already has an active subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { agencyId: agencyId },
      });

      if (existingSubscription) {
        return res.status(409).json({ error: 'Agency already has a subscription' });
      }

      const newSubscription = await prisma.subscription.create({
        data: {
          agency: { connect: { id: agencyId } },
          plan: { connect: { id: planId } },
          status,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
        },
      });
      res.status(201).json(newSubscription);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
