import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withApiAuth } from '@/lib/withApiAuth';
import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  if (req.method === 'PUT') {
    const { currency, name } = req.body;

    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: 'Invalid currency format' });
    }

    try {
      const dataToUpdate: { currency?: string; name?: string } = {};
      if (currency) dataToUpdate.currency = currency;
      if (name) dataToUpdate.name = name;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'No settings to update' });
      }

      const updatedAgency = await prisma.agency.update({
        where: { id: session.user.agencyId },
        data: dataToUpdate,
      });
      return res.status(200).json(updatedAgency);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update agency settings', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, [UserRole.AGENCY_OWNER]);
