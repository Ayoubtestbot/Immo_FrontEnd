
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@prisma/client';

export function withApiAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, session: Session) => void,
  roles: UserRole[]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length > 0 && !roles.includes(session.user.role as UserRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return handler(req, res, session);
  };
}
