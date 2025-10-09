import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import * as brevo from '@getbrevo/brevo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { agencyName } = req.body;

      if (!agencyName) {
        return res.status(400).json({ error: 'Missing agency name' });
      }

      const freeTrialPlan = await prisma.plan.findFirst({
        where: { name: 'Free Trial' },
      });

      if (!freeTrialPlan) {
        return res.status(500).json({ error: 'Free Trial plan not found. Please configure plans.' });
      }

      const updatedUser = await prisma.$transaction(async (prisma) => {
        const newAgency = await prisma.agency.create({
          data: {
            name: agencyName,
            currency: 'MAD',
          },
        });

        const user = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            role: UserRole.AGENCY_OWNER,
            agencyId: newAgency.id,
          },
        });

        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 14); // 14 days free trial

        await prisma.subscription.create({
          data: {
            agencyId: newAgency.id,
            planId: freeTrialPlan.id,
            status: 'active',
            startDate: new Date(),
            endDate: subscriptionEndDate,
          },
        });

        return user;
      });

      // Send welcome email
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_EMAIL_KEY || '');

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = "Bienvenue sur LeadEstate";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Bienvenue sur LeadEstate, ${session.user.name}!</h2>
          <p>Nous sommes ravis de vous compter parmi nous. Votre agence, ${agencyName}, a été créée avec succès.</p>
          <p>Vous pouvez maintenant commencer à gérer vos prospects et vos propriétés plus efficacement.</p>
          <p>Pour commencer, connectez-vous à votre compte.</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Merci,</p>
          <p>L'équipe LeadEstate</p>
        </div>
      `;
      sendSmtpEmail.sender = { name: 'LeadEstate', email: 'no-reply@leadestate.com' };
      sendSmtpEmail.to = [{ email: session.user.email, name: session.user.name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create agency', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
