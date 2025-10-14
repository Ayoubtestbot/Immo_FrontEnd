import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withApiAuth } from '@/lib/withApiAuth';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          read: false,
        },
      });

      return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  if (req.method === 'PUT') {
    try {
      await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
      return res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withApiAuth(handler, [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER, UserRole.AGENCY_SUPER_AGENT]);
