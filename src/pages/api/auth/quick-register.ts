import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, password, agencyName } = req.body;

  if (!name || !email || !password || !agencyName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
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

    // Create agency, user, and subscription in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const newAgency = await prisma.agency.create({
        data: {
          name: agencyName,
          currency: 'MAD', // Default currency for new agencies
        },
      });

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.AGENCY_OWNER, // First user is always an owner
          agency: {
            connect: { id: newAgency.id },
          },
        },
      });

      // Create a subscription for the free trial plan
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          agencyId: newAgency.id,
          planId: freeTrialPlan.id,
          status: 'active',
          startDate: new Date(),
          endDate: subscriptionEndDate,
        },
      });

      return newUser;
    });

    return res.status(201).json({ message: 'Account created successfully', user: result });
  } catch (error: any) {
    console.error('Quick registration failed:', error);
    return res.status(500).json({ error: 'Failed to create account', details: error.message });
  }
}
