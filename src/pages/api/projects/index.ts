import { withApiAuth } from '@/lib/withApiAuth';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === 'POST') {
    const { name, description, country, city } = req.body;
    const agencyId = session.user.agencyId;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          country,
          city,
          agencyId,
        },
      });
      res.status(201).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  } else if (req.method === 'GET') {
    const agencyId = session.user.agencyId;

    try {
      const projects = await prisma.project.findMany({
        where: {
          agencyId,
        },
        include: {
          _count: {
            select: { properties: true },
          },
        },
      });
      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);
