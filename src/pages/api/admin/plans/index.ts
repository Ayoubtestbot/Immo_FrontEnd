import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { UserRole } from '@prisma/client'; // Import UserRole enum

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== UserRole.ADMIN) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { name: 'asc' },
      });
      res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, price, prospectsLimit, features } = req.body;

      if (!name || price === undefined || prospectsLimit === undefined || !features) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newPlan = await prisma.plan.create({
        data: {
          name,
          price: parseFloat(price),
          prospectsLimit: parseInt(prospectsLimit),
          features,
        },
      });
      res.status(201).json(newPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create plan' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
