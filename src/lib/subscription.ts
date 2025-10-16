import { prisma } from './prisma';

export const isTrialActive = async (agencyId: string): Promise<boolean> => {
  if (!agencyId) {
    return false;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { agencyId },
  });

  console.log('SUBSCRIPTION OBJECT:', subscription); // Debugging line

  if (!subscription) {
    return false;
  }

  // If the subscription is explicitly 'ACTIVE', they are good to go.
  if (subscription.status === 'ACTIVE') {
    return true;
  }

  // Original logic for trial periods with an end date.
  if (!subscription.endDate) {
    return false;
  }

  return new Date() < subscription.endDate;
};
