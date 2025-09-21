import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

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

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const hashedPassword = await hash(password, 10);

      // Create a new agency and the user as the owner
      const newAgency = await prisma.agency.create({
        data: {
          name: agencyName,
          users: {
            create: {
              email,
              name,
              password: hashedPassword,
              role: 'AGENCY_OWNER',
            },
          },
        },
        include: {
          users: true,
        },
      });

      res.status(201).json(newAgency.users[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user and agency' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
