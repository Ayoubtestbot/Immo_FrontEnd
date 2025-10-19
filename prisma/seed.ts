import { PrismaClient, LeadStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');

  // Create an Admin user if one doesn't exist
  const hashedPassword = await hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ayoub@test.com' },
    update: {},
    create: {
      email: 'ayoub@test.com',
      name: 'Ayoub',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user upserted.`);

  // Upsert plans
  await prisma.plan.upsert({
    where: { name: 'Free Trial' },
    update: {
        price: 0.00,
        prospectsLimit: 10,
        usersLimit: 1,
        projectsLimit: 1,
        features: 'Gestion de 10 prospects, 1 projet, 1 utilisateur',
    },
    create: {
      name: 'Free Trial',
      price: 0.00,
      prospectsLimit: 10,
      usersLimit: 1,
      projectsLimit: 1,
      features: 'Gestion de 10 prospects, 1 projet, 1 utilisateur',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Starter' },
    update: {
        price: 49.00,
        prospectsLimit: 50,
        usersLimit: 5,
        projectsLimit: 5,
        features: 'Gestion de 50 prospects, 5 projets, 5 utilisateurs, Accès aux fonctionnalités de base, Support par email',
    },
    create: {
      name: 'Starter',
      price: 49.00,
      prospectsLimit: 50,
      usersLimit: 5,
      projectsLimit: 5,
      features: 'Gestion de 50 prospects, 5 projets, 5 utilisateurs, Accès aux fonctionnalités de base, Support par email',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {
        price: 99.00,
        prospectsLimit: -1,
        usersLimit: -1,
        projectsLimit: 10,
        features: 'Gestion illimitée de prospects, 10 projets, utilisateurs illimités, Rapports avancés, Intégration CRM, Support prioritaire',
    },
    create: {
      name: 'Pro',
      price: 99.00,
      prospectsLimit: -1,
      usersLimit: -1,
      projectsLimit: 10,
      features: 'Gestion illimitée de prospects, 10 projets, utilisateurs illimités, Rapports avancés, Intégration CRM, Support prioritaire',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Entreprise' },
    update: {
        price: 0.00, // Price on quote
        prospectsLimit: -1,
        usersLimit: -1,
        projectsLimit: -1,
        features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l\'équipe',
    },
    create: {
      name: 'Entreprise',
      price: 0.00, // Price on quote
      prospectsLimit: -1,
      usersLimit: -1,
      projectsLimit: -1,
      features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l\'équipe',
    },
  });

  console.log('Plans upserted.');

  const agency = await prisma.agency.upsert({
    where: { name: 'Test Agency' },
    update: {},
    create: {
      name: 'Test Agency',
      country: 'Morocco',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      email: 'manager@test.com',
      name: 'Manager User',
      password: hashedPassword,
      role: 'AGENCY_OWNER',
      agencyId: agency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'superagent@test.com' },
    update: {},
    create: {
      email: 'superagent@test.com',
      name: 'Super Agent User',
      password: hashedPassword,
      role: 'AGENCY_SUPER_AGENT',
      agencyId: agency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: {
      email: 'agent@test.com',
      name: 'Agent User',
      password: hashedPassword,
      role: 'AGENCY_MEMBER',
      agencyId: agency.id,
    },
  });

  console.log('Test agency and users upserted.');

  // Find the Starter plan
  const starterPlan = await prisma.plan.findUnique({
    where: { name: 'Starter' },
  });

  if (starterPlan) {
    // Check if a subscription already exists for the agency
    const existingSubscription = await prisma.subscription.findUnique({
      where: { agencyId: agency.id },
    });

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          agencyId: agency.id,
          planId: starterPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
        },
      });
      console.log(`Subscription created for Test Agency with Starter plan.`);
    } else {
      console.log(`Subscription already exists for Test Agency.`);
    }
  } else {
    console.log('Starter plan not found, skipping subscription creation.');
  }

  // Create a second agency for testing
  const secondAgency = await prisma.agency.upsert({
    where: { name: 'Second Test Agency' },
    update: {},
    create: {
      name: 'Second Test Agency',
      country: 'France',
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@second.com' },
    update: {},
    create: {
      email: 'owner@second.com',
      name: 'Owner Second',
      password: hashedPassword,
      role: 'AGENCY_OWNER',
      agencyId: secondAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'super@second.com' },
    update: {},
    create: {
      email: 'super@second.com',
      name: 'Super Second',
      password: hashedPassword,
      role: 'AGENCY_SUPER_AGENT',
      agencyId: secondAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'agent@second.com' },
    update: {},
    create: {
      email: 'agent@second.com',
      name: 'Agent Second',
      password: hashedPassword,
      role: 'AGENCY_MEMBER',
      agencyId: secondAgency.id,
    },
  });

  console.log('Second test agency and users upserted.');

  const proPlan = await prisma.plan.findUnique({ where: { name: 'Pro' } });
  if (proPlan) {
    const secondSubscription = await prisma.subscription.findUnique({ where: { agencyId: secondAgency.id } });
    if (!secondSubscription) {
      await prisma.subscription.create({
        data: {
          agencyId: secondAgency.id,
          planId: proPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
        },
      });
      console.log(`Subscription created for Second Test Agency with Pro plan.`);
    } else {
      console.log(`Subscription already exists for Second Test Agency.`);
    }
  } else {
    console.log('Pro plan not found, skipping subscription creation for second agency.');
  }

  // Create a third agency for testing
  const thirdAgency = await prisma.agency.upsert({
    where: { name: 'Third Test Agency' },
    update: {},
    create: {
      name: 'Third Test Agency',
      country: 'USA',
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@third.com' },
    update: {},
    create: {
      email: 'owner@third.com',
      name: 'Owner Third',
      password: hashedPassword,
      role: 'AGENCY_OWNER',
      agencyId: thirdAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'super1@third.com' },
    update: {},
    create: {
      email: 'super1@third.com',
      name: 'Super Agent 1',
      password: hashedPassword,
      role: 'AGENCY_SUPER_AGENT',
      agencyId: thirdAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'super2@third.com' },
    update: {},
    create: {
      email: 'super2@third.com',
      name: 'Super Agent 2',
      password: hashedPassword,
      role: 'AGENCY_SUPER_AGENT',
      agencyId: thirdAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'agent1@third.com' },
    update: {},
    create: {
      email: 'agent1@third.com',
      name: 'Agent 1',
      password: hashedPassword,
      role: 'AGENCY_MEMBER',
      agencyId: thirdAgency.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'agent2@third.com' },
    update: {},
    create: {
      email: 'agent2@third.com',
      name: 'Agent 2',
      password: hashedPassword,
      role: 'AGENCY_MEMBER',
      agencyId: thirdAgency.id,
    },
  });

  console.log('Third test agency and user upserted.');

  const entreprisePlan = await prisma.plan.findUnique({ where: { name: 'Entreprise' } });
  if (entreprisePlan) {
    const thirdSubscription = await prisma.subscription.findUnique({ where: { agencyId: thirdAgency.id } });
    if (!thirdSubscription) {
      await prisma.subscription.create({
        data: {
          agencyId: thirdAgency.id,
          planId: entreprisePlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
        },
      });
      console.log(`Subscription created for Third Test Agency with Entreprise plan.`);
    } else {
      console.log(`Subscription already exists for Third Test Agency.`);
    }
  } else {
    console.log('Entreprise plan not found, skipping subscription creation for third agency.');
  }

  const agent = await prisma.user.findUnique({ where: { email: 'agent@test.com' } });
  const testAgency = await prisma.agency.findUnique({ where: { name: 'Test Agency' } });

  if (agent && testAgency) {
    const firstNames = ['Fatima', 'Mohamed', 'Aicha', 'Ahmed', 'Khadija', 'Youssef', 'Amina', 'Ali', 'Saida', 'Hassan'];
    const lastNames = ['Alaoui', 'Bennani', 'Cherkaoui', 'Daoudi', 'El Fassi', 'Guerrouj', 'Haddad', 'Idrissi', 'Jebli', 'Kacemi'];
    const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'];
    const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'FOLLOW_UP', 'RELAUNCHED', 'NEGOTIATION', 'CONVERTED', 'LOST'];

    for (let i = 0; i < 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      await prisma.lead.create({
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@test.com`,
          phone: `+2126${Math.floor(10000000 + Math.random() * 90000000)}`,
          city: cities[Math.floor(Math.random() * cities.length)],
          country: 'Morocco',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          agencyId: testAgency.id,
          assignedToId: agent.id,
        },
      });
    }
    console.log('200 random leads created.');
  }
  console.log('Seed script finished.');
}

main()
  .catch((e) => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });