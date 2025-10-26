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
      const leadStatusOptions = await prisma.leadStatusOption.findMany({
        where: {
          agencyId: session.user.agencyId,
        },
        orderBy: {
          order: 'asc',
        },
      });
      return res.status(200).json(leadStatusOptions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch lead status options' });
    }
  } else if (req.method === 'POST') {
    const { name, color, order, isLastStep, translation } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    try {
      if (isLastStep) {
        const [, newLeadStatusOption] = await prisma.$transaction([
          prisma.leadStatusOption.updateMany({
            where: {
              agencyId: session.user.agencyId,
            },
            data: { isLastStep: false },
          }),
          prisma.leadStatusOption.create({
            data: {
              name,
              color,
              order: order || 0,
              isLastStep: true,
              translation,
              agencyId: session.user.agencyId,
            },
          }),
        ]);
        return res.status(201).json(newLeadStatusOption);
      } else {
        const newLeadStatusOption = await prisma.leadStatusOption.create({
          data: {
            name,
            color,
            order: order || 0,
            isLastStep: false,
            translation,
            agencyId: session.user.agencyId,
          },
        });
        return res.status(201).json(newLeadStatusOption);
      }
      return res.status(201).json(newLeadStatusOption);
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Lead status with this name already exists for your agency' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Failed to create lead status option' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}