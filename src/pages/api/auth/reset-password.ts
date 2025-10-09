import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Email, token, and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.resetPasswordToken || !user.resetPasswordTokenExpiry) {
      return res.status(400).json({ error: 'Invalid token or email' });
    }

    if (new Date() > user.resetPasswordTokenExpiry) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    const isTokenValid = await compare(token, user.resetPasswordToken);

    if (!isTokenValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
}
