import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');

  // Create an Admin user if one doesn't exist
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }, // Updated email
  });

  if (!adminUser) {
    const hashedPassword = await hash('password123', 10); // Updated password
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com', // Updated email
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
  console.log('Checking for existing plans...');
  let starterPlan = await prisma.plan.findUnique({ where: { name: 'Agence Starter' } });
  if (!starterPlan) {
    starterPlan = await prisma.plan.create({
      data: {
        name: 'Agence Starter',
        price: 49.00,
        prospectsLimit: 50,
        usersLimit: 5, // Added usersLimit
        features: 'Gestion de 50 prospects, Accès aux fonctionnalités de base, Support par email',
      },
    });
    console.log(`Created plan: ${starterPlan.name}`);
  } else {
    console.log(`Plan already exists: ${starterPlan.name}`);
  }

  let proPlan = await prisma.plan.findUnique({ where: { name: 'Agence Pro' } });
  if (!proPlan) {
    proPlan = await prisma.plan.create({
      data: {
        name: 'Agence Pro',
        price: 99.00,
        prospectsLimit: -1,
        usersLimit: -1, // Added usersLimit
        features: 'Gestion illimitée de prospects, Rapports avancés, Intégration CRM, Support prioritaire',
      },
    });
    console.log(`Created plan: ${proPlan.name}`);
  } else {
    console.log(`Plan already exists: ${proPlan.name}`);
  }

  let enterprisePlan = await prisma.plan.findUnique({ where: { name: 'Agence Entreprise' } });
  if (!enterprisePlan) {
    enterprisePlan = await prisma.plan.create({
      data: {
        name: 'Agence Entreprise',
        price: 0.00, // Price on quote
        prospectsLimit: -1,
        usersLimit: -1, // Added usersLimit
        features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l\'équipe',
      },
    });
    console.log(`Created plan: ${enterprisePlan.name}`);
  } else {
    console.log(`Plan already exists: ${enterprisePlan.name}`);
  }
  console.log('Seed script finished.');

} // End of main function

main()
  .catch((e) => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
