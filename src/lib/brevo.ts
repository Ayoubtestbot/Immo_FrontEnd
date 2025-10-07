import { Lead, User } from '@prisma/client';

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/8799995/u9e0rqn/';

export const sendSms = async (lead: Lead, agent?: User) => {
  const payload = {
    lead: {
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      trafficSource: lead.trafficSource,
      status: lead.status,
      isUrgent: lead.isUrgent,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    },
    agent: agent ? {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
    } : null,
  };

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed with status ${response.status}`);
    }

    console.log('Successfully sent data to Zapier webhook');
  } catch (error) {
    console.error('Error sending data to Zapier webhook:', error);
    // Optionally, re-throw the error if you want the caller to handle it
    // throw error;
  }
};
