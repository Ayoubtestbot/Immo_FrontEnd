import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client'; // New import
import * as brevo from '@getbrevo/brevo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { name, email, password, agencyName } = req.body;

      if (!name || !email || !password || !agencyName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Find the 'Free Trial' plan
      const freeTrialPlan = await prisma.plan.findFirst({
        where: { name: 'Free Trial' },
      });

      if (!freeTrialPlan) {
        return res.status(500).json({ error: 'Free Trial plan not found. Please configure plans.' });
      }

      const hashedPassword = await hash(password, 10);

      // Use a transaction to ensure agency, user, and subscription are created successfully
      const newUser = await prisma.$transaction(async (prisma) => {
        const newAgency = await prisma.agency.create({
          data: {
            name: agencyName,
            currency: 'MAD', // Default currency for new agencies
          },
        });

        const user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: UserRole.AGENCY_OWNER, // First user is always an owner
            agency: {
              connect: { id: newAgency.id },
            },
          },
        });

        // Create a subscription for the free trial plan
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
          <h2>Bienvenue sur LeadEstate, ${name}!</h2>
          <p>Nous sommes ravis de vous compter parmi nous. Votre agence, ${agencyName}, a été créée avec succès.</p>
          <p>Vous pouvez maintenant commencer à gérer vos prospects et vos propriétés plus efficacement.</p>
          <p>Pour commencer, connectez-vous à votre compte en utilisant votre adresse e-mail et votre mot de passe.</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Merci,</p>
          <p>L'équipe LeadEstate</p>
        </div>
      `;
      sendSmtpEmail.sender = { name: 'LeadEstate', email: 'no-reply@leadestate.com' };
      sendSmtpEmail.to = [{ email, name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error('Brevo API Error:', error.response?.body || error.message);
      res.status(500).json({ error: 'Failed to create user and agency', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
