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

  if (req.method === 'GET') {
    try {
      const agencies = await prisma.agency.findMany({
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          },
          subscription: {
            include: { plan: true }
          }
        },
        orderBy: { name: 'asc' },
      });
      res.status(200).json(agencies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch agencies' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing required fields: name' });
      }

      const newAgency = await prisma.agency.create({
        data: {
          name,
        },
      });
      res.status(201).json(newAgency);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create agency' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
