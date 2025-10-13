import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client';
import { isTrialActive } from '@/lib/subscription';
import { withApiAuth } from '@/lib/withApiAuth';
import { Session } from 'next-auth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  if (!session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const trialActive = await isTrialActive(session.user.agencyId);
    if (!trialActive) {
      return res.status(403).json({ error: 'Your free trial has expired. Please upgrade your plan to add new users.' });
    }

    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    try {
      // Check plan limits
      const agency = await prisma.agency.findUnique({
        where: { id: session.user.agencyId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          users: {
            select: { id: true },
          },
        },
      });

      if (!agency || !agency.subscription || !agency.subscription.plan) {
        return res.status(403).json({ error: 'Agency has no active plan' });
      }

      const currentUsersCount = agency.users.length;
      const planUsersLimit = agency.subscription.plan.usersLimit;

      if (currentUsersCount >= planUsersLimit) {
        return res.status(403).json({ error: 'User limit reached for your current plan' });
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phone,
          agency: {
            connect: {
              id: session.user.agencyId,
            },
          },
        },
      });
      return res.status(201).json(newUser);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      return res.status(500).json({ error: 'Failed to add user', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, [UserRole.AGENCY_OWNER]);