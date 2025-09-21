import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create an Admin user if one doesn't exist
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@leadestate.com' },
  });

  if (!adminUser) {
    const hashedPassword = await hash('adminpassword', 10);
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@leadestate.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  } else {
    console.log(`Admin user already exists: ${adminUser.email}`);
  }

  // You can add more seed data here if needed
  // For example, default plans
  let starterPlan = await prisma.plan.findUnique({ where: { name: 'Agence Starter' } });
  if (!starterPlan) {
    starterPlan = await prisma.plan.create({
      data: {
        name: 'Agence Starter',
        price: 49.00,
        prospectsLimit: 50,
        features: 'Gestion de 50 prospects, Accès aux fonctionnalités de base, Support par email',
      },
    });
    console.log(`Created plan: ${starterPlan.name}`);
  }

  let proPlan = await prisma.plan.findUnique({ where: { name: 'Agence Pro' } });
  if (!proPlan) {
    proPlan = await prisma.plan.create({
      data: {
        name: 'Agence Pro',
        price: 99.00,
        prospectsLimit: -1,
        features: 'Gestion illimitée de prospects, Rapports avancés, Intégration CRM, Support prioritaire',
      },
    });
    console.log(`Created plan: ${proPlan.name}`);
  }

  let enterprisePlan = await prisma.plan.findUnique({ where: { name: 'Agence Entreprise' } });
  if (!enterprisePlan) {
    enterprisePlan = await prisma.plan.create({
      data: {
        name: 'Agence Entreprise',
        price: 0.00, // Price on quote
        prospectsLimit: -1,
        features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l'équipe',
      },
    });
    console.log(`Created plan: ${enterprisePlan.name}`);
  }

} // End of main function

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
