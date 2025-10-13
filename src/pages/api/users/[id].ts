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

  const { id } = req.query as { id: string };

  if (req.method === 'PUT') {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Prevent AGENCY_OWNER from changing their own role
    if (id === session.user.id && role !== session.user.role) {
      return res.status(403).json({ error: 'Agency owner cannot change their own role' });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
          phone,
          ...(password && { password: await hash(password, 10) }), // Only update password if provided
        },
      });
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Prevent AGENCY_OWNER from deleting their own account
    if (id === session.user.id) {
      return res.status(403).json({ error: 'Agency owner cannot delete their own account' });
    }

    try {
      await prisma.user.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}