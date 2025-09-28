import { prisma } from './prisma';

export const isTrialActive = async (agencyId: string): Promise<boolean> => {
  if (!agencyId) {
    return false;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { agencyId },
  });

  if (!subscription || !subscription.endDate) {
    return false;
  }

  return new Date() < subscription.endDate;

};
