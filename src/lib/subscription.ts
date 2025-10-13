import { prisma } from './prisma';

export const isTrialActive = async (agencyId: string): Promise<boolean> => {

  if (!agencyId) {

    return false;

  }



  const subscription = await prisma.subscription.findFirst({

    where: { agencyId },

  });



  console.log('subscription', subscription);



  if (!subscription || !subscription.endDate) {

    return false;

  }



  console.log('new Date() < subscription.endDate', new Date() < subscription.endDate);



  return new Date() < subscription.endDate;

};
