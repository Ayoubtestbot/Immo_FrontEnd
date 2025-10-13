import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withApiAuth } from '@/lib/withApiAuth';
import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';
import { hash, compare } from 'bcrypt';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return res.status(404).json({ error: 'User not found or password not set' });
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const hashedNewPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to change password', details: error.message });
  }
}

export default withApiAuth(handler, [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER, UserRole.AGENCY_SUPER_AGENT]);
