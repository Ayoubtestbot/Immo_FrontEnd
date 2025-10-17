import { withApiAuth } from '@/lib/withApiAuth';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === 'POST') {
    const { propertyIds } = req.body;
    const agencyId = session.user.agencyId;

    if (!propertyIds) {
      return res.status(400).json({ error: 'Missing propertyIds' });
    }

    if (session.user.role === 'AGENCY_MEMBER') {
      return res.status(403).json({ error: 'You do not have permission to delete these properties' });
    }

    try {
      await prisma.property.deleteMany({
        where: {
          id: {
            in: propertyIds,
          },
          agencyId: agencyId,
        },
      });
      res.status(200).json({ message: 'Properties deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete properties' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);
