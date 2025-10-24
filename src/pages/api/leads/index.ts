import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { isTrialActive } from '@/lib/subscription';
import { sendSms } from '@/lib/brevo';
import { withApiAuth } from '@/lib/withApiAuth';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  if (!session.user.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { agencyId: true },
  });

  if (!user || !user.agencyId) {
    return res.status(403).json({ error: 'User is not associated with an agency' });
  }

  const agencyId = user.agencyId;

  if (req.method === 'GET') {
    try {
      const leads = await prisma.lead.findMany({
        where: { agencyId: agencyId },
      });
      res.status(200).json(leads);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  } else if (req.method === 'POST') {
    try {
      const trialActive = await isTrialActive(agencyId);
      if (!trialActive) {
        return res.status(403).json({ error: 'Your free trial has expired. Please upgrade your plan to add new leads.' });
      }

      const { firstName, lastName, email, phone, city, sourceId } = req.body;

      if (!firstName || !lastName || !phone) { // Updated validation
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newLead = await prisma.lead.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          city,
          ...(sourceId && { source: { connect: { id: sourceId } } }),
          agency: {
            connect: { id: agencyId },
          },
        },
      });

      // Send SMS to the new lead
      await sendSms(newLead);

      res.status(201).json(newLead);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER]);