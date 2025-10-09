import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcrypt';
import * as brevo from '@getbrevo/brevo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a 6-digit random code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = await hash(resetToken, 10);

    // Set token expiry to 1 hour from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiry: expiryDate,
      },
    });

    // Send email using Brevo
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_EMAIL_KEY || '');

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Réinitialisation de votre mot de passe";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${user.name || ''},</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte LeadEstate. Utilisez le code ci-dessous pour réinitialiser votre mot de passe :</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center;">${resetToken}</p>
        <p>Ce code expirera dans une heure. Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.</p>
        <p>Merci,</p>
        <p>L'équipe LeadEstate</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@leadestate.com">support@leadestate.com</a>.</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: 'LeadEstate', email: 'no-reply@leadestate.com' };
    sendSmtpEmail.to = [{ email: user.email, name: user.name || '' }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: 'Un e-mail avec un code de réinitialisation a été envoyé à votre adresse e-mail.' });
  } catch (error: any) {
    console.error('Brevo API Error:', error.response?.body || error.message);
    res.status(500).json({ error: 'An error occurred while sending the reset email.' });
  }
}
