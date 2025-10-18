import { withApiAuth } from '@/lib/withApiAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === 'POST') {
    const { propertyId, agentId, showingDate } = req.body;

    if (!propertyId || !agentId || !showingDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const showing = await prisma.showing.create({
        data: {
          propertyId,
          agentId,
          showingDate: new Date(showingDate),
        },
      });
      res.status(201).json(showing);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create showing' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_SUPER_AGENT']);
