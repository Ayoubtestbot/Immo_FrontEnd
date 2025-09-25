import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId || session.user.role !== UserRole.AGENCY_OWNER) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { name, email, password, role } = req.body;

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
      const planUsersLimit = agency.subscription.plan.usersLimit; // Using the new usersLimit field

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