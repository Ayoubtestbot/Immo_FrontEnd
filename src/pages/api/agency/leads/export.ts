import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== UserRole.AGENCY_OWNER) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const leads = await prisma.lead.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        trafficSource: true,
        status: true,
        createdAt: true,
      },
    });

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found for this agency.' });
    }

    // Generate CSV header
    const csvHeader = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Ville', 'Source de trafic', 'Statut', 'Date de création'].join(',');

    // Generate CSV rows
    const csvRows = leads.map(lead => {
      return [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone || '',
        lead.city || '',
        lead.trafficSource || '',
        lead.status,
        new Date(lead.createdAt).toLocaleDateString(),
      ].map(field => `"${field}"`).join(','); // Wrap fields in quotes to handle commas in data
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="prospects.csv"');
    res.status(200).send(csvContent);

  } catch (error: any) {
    console.error('Lead export error:', error);
    res.status(500).json({ error: 'Failed to export leads', details: error.message });
  }
}

export default handler;
