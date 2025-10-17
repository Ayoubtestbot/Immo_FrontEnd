import { withApiAuth } from '@/lib/withApiAuth';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === 'POST') {
    const { propertyIds, projectId } = req.body;
    const agencyId = session.user.agencyId;

    if (!propertyIds || !projectId) {
      return res.status(400).json({ error: 'Missing propertyIds or projectId' });
    }

    try {
      await prisma.property.updateMany({
        where: {
          id: {
            in: propertyIds,
          },
          agencyId: agencyId,
        },
        data: {
          projectId: projectId,
        },
      });
      res.status(200).json({ message: 'Properties updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update properties' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);
