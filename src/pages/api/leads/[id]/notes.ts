import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next'; // Correct import
import { authOptions } from '../../auth/[...nextauth]'; // Import authOptions
import { ActivityType } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions); // Correct usage
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid lead ID' });
  }

  if (req.method === 'POST') {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Note content cannot be empty' });
      }

      // Verify the lead exists and belongs to the user's agency
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          agencyId: session.user.agencyId,
        },
      });

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      // Create the note and the activity in a transaction
      const [newNote, activity] = await prisma.$transaction([
        prisma.note.create({
          data: {
            content,
            leadId: id,
            authorId: session.user.id,
          },
        }),
        prisma.activity.create({
          data: {
            leadId: id,
            type: ActivityType.NOTE_ADDED,
            details: `Note ajoutée par ${session.user.name}`,
          },
        }),
      ]);

      res.status(201).json(newNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add note' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}