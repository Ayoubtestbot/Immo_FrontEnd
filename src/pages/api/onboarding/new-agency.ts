import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { agencyName } = req.body;

      if (!agencyName) {
        return res.status(400).json({ error: 'Missing agency name' });
      }

      const freeTrialPlan = await prisma.plan.findFirst({
        where: { name: 'Free Trial' },
      });

      if (!freeTrialPlan) {
        return res.status(500).json({ error: 'Free Trial plan not found. Please configure plans.' });
      }

      const updatedUser = await prisma.$transaction(async (prisma) => {
        const newAgency = await prisma.agency.create({
          data: {
            name: agencyName,
            currency: 'MAD',
          },
        });

        const user = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            role: UserRole.AGENCY_OWNER,
            agencyId: newAgency.id,
          },
        });

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 14); // 14 days free trial

        await prisma.subscription.create({
          data: {
            agencyId: newAgency.id,
            planId: freeTrialPlan.id,
            status: 'active',
            startDate: new Date(),
            endDate: subscriptionEndDate,
          },
        });

        return user;
      });

      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create agency', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
