import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client'; // New import

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { name, email, password, agencyName } = req.body;

      if (!name || !email || !password || !agencyName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Find the 'Free Trial' plan
      const freeTrialPlan = await prisma.plan.findFirst({
        where: { name: 'Free Trial' },
      });

      if (!freeTrialPlan) {
        return res.status(500).json({ error: 'Free Trial plan not found. Please configure plans.' });
      }

      const hashedPassword = await hash(password, 10);

      // Use a transaction to ensure agency, user, and subscription are created successfully
      const newUser = await prisma.$transaction(async (prisma) => {
        const newAgency = await prisma.agency.create({
          data: {
            name: agencyName,
            currency: 'MAD', // Default currency for new agencies
          },
        });

        const user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: UserRole.AGENCY_OWNER, // First user is always an owner
            agency: {
              connect: { id: newAgency.id },
            },
          },
        });

        // Create a subscription for the free trial plan
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

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user and agency', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
