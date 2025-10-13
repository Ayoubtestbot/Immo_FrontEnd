import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { LeadStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'POST') {
    const form = formidable({
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    try {
      const [fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results: any[] = [];
      const fileStream = new Readable();
      fileStream.push(await require('fs/promises').readFile(file.filepath));
      fileStream.push(null);

      await new Promise((resolve, reject) => {
        fileStream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      const leadsToCreate = results.map((row) => ({
        firstName: row.firstName || row.prenom || '',
        lastName: row.lastName || row.nom || '',
        email: row.email || row.courriel || '',
        phone: row.phone || row.telephone || null,
        city: row.city || row.ville || null, // New field
        trafficSource: row.trafficSource || row.source_de_trafic || null, // New field
        status: LeadStatus.NEW, // Default status for imported leads
        agencyId: session.user.agencyId as string,
      }));

      // Basic validation before creating
      const validLeads = leadsToCreate.filter(lead => lead.firstName && lead.lastName && lead.email);
      if (validLeads.length === 0) {
        return res.status(400).json({ error: 'No valid leads found in the file. Ensure firstName, lastName, and email columns are present.' });
      }

      const createdLeads = await prisma.lead.createMany({
        data: validLeads,
      });

      res.status(200).json({ importedCount: createdLeads.count });
    } catch (error: any) {
      console.error('Lead import error:', error);
      res.status(500).json({ error: error.message || 'Failed to import leads' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;