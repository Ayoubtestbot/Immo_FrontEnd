import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    try {
      const leadStatusOption = await prisma.leadStatusOption.findUnique({
        where: { id },
      });

      if (!leadStatusOption || leadStatusOption.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Lead status option not found or unauthorized' });
      }

      return res.status(200).json(leadStatusOption);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch lead status option' });
    }
  } else if (req.method === 'PUT') {
    const { name, color, order, isLastStep, translation } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    try {
      const existingLeadStatusOption = await prisma.leadStatusOption.findUnique({
        where: { id },
      });

      if (!existingLeadStatusOption || existingLeadStatusOption.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Lead status option not found or unauthorized' });
      }

      const dataToUpdate: any = { name, color, order: order || 0 };
      if (translation !== undefined) {
        dataToUpdate.translation = translation;
      }

      if (isLastStep === true) {
        const [, updatedLeadStatusOption] = await prisma.$transaction([
          prisma.leadStatusOption.updateMany({
            where: {
              agencyId: session.user.agencyId,
              id: { not: id },
            },
            data: { isLastStep: false },
          }),
          prisma.leadStatusOption.update({
            where: { id },
            data: { ...dataToUpdate, isLastStep: true },
          }),
        ]);
        return res.status(200).json(updatedLeadStatusOption);
      } else if (isLastStep === false) {
        const updatedLeadStatusOption = await prisma.leadStatusOption.update({
          where: { id },
          data: { ...dataToUpdate, isLastStep: false },
        });
        return res.status(200).json(updatedLeadStatusOption);
      } else { // isLastStep is undefined
        const updatedLeadStatusOption = await prisma.leadStatusOption.update({
          where: { id },
          data: dataToUpdate, // isLastStep is not included
        });
        return res.status(200).json(updatedLeadStatusOption);
      }
      return res.status(200).json(updatedLeadStatusOption);
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Lead status with this name already exists for your agency' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Failed to update lead status option' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const existingLeadStatusOption = await prisma.leadStatusOption.findUnique({
        where: { id },
      });

      if (!existingLeadStatusOption || existingLeadStatusOption.agencyId !== session.user.agencyId) {
        return res.status(404).json({ error: 'Lead status option not found or unauthorized' });
      }

      await prisma.leadStatusOption.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete lead status option' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}