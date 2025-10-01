import * as Brevo from '@getbrevo/brevo';
import { User, Lead } from '@prisma/client';

const apiInstance = new Brevo.TransactionalSMSApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY || '';

export const sendSms = async (lead: Lead, agent?: User) => {
  let recipientPhone = lead.phone;
  let textContent: string; // Declare textContent here

  if (!recipientPhone) {
    console.log('Lead does not have a valid phone number, skipping SMS.');
    return;
  }

  if (agent && agent.phone) {
    textContent = `Bonjour ${lead.firstName}, nous avons bien reçu vos informations. Votre agent ${agent.name} vous contactera bientôt. Son numéro de téléphone est le ${agent.phone}.`;
  } else {
    textContent = `Bonjour ${lead.firstName}, nous avons bien reçu vos informations. Un agent vous contactera bientôt.`;
  }

  const sendSms = new Brevo.SendTransacSms();
  sendSms.sender = 'LeadEstate';
  sendSms.recipient = recipientPhone;
  sendSms.content = textContent; // Use the defined textContent
  sendSms.type = 'transactional';

  try {
    await apiInstance.sendTransacSms(sendSms);
    console.log('SMS sent successfully.');
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
};
