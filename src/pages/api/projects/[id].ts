import { withApiAuth } from '@/lib/withApiAuth';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { id } = req.query;
  const agencyId = session.user.agencyId;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const project = await prisma.project.findUnique({
        where: {
          id: id,
          agencyId: agencyId,
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  } else if (req.method === 'PUT') {
    const { name, description, country, city } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const updatedProject = await prisma.project.update({
        where: {
          id: id,
          agencyId: agencyId,
        },
        data: {
          name,
          description,
          country,
          city,
        },
      });
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.project.delete({
        where: {
          id: id,
          agencyId: agencyId,
        },
      });
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);
