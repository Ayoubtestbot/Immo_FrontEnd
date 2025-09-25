const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const plansData = [
    {
      name: 'Starter',
      price: 29,
      prospectsLimit: 1000,
      features: '2 utilisateurs',
    },
    {
      name: 'Pro',
      price: 49,
      prospectsLimit: 5000,
      features: '5 utilisateurs',
    },
    {
      name: 'Business',
      price: 99,
      prospectsLimit: 20000,
      features: '20 utilisateurs',
    },
  ];

  for (const planData of plansData) {
    const existingPlan = await prisma.plan.findUnique({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({ data: planData });
      console.log(`Plan '${planData.name}' created.`);
    } else {
      console.log(`Plan '${planData.name}' already exists.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
