import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

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
  console.log(`Admin user upserted.`);

  // Upsert plans
  await prisma.plan.upsert({
    where: { name: 'Free Trial' },
    update: {
        price: 0.00,
        prospectsLimit: 10,
        usersLimit: 1,
        propertiesLimit: 3,
        features: 'Gestion de 10 prospects, 3 propriétés, 1 utilisateur',
    },
    create: {
      name: 'Free Trial',
      price: 0.00,
      prospectsLimit: 10,
      usersLimit: 1,
      propertiesLimit: 3,
      features: 'Gestion de 10 prospects, 3 propriétés, 1 utilisateur',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Agence Starter' },
    update: {
        price: 49.00,
        prospectsLimit: 50,
        usersLimit: 5,
        propertiesLimit: 10,
        features: 'Gestion de 50 prospects, 10 propriétés, 5 utilisateurs, Accès aux fonctionnalités de base, Support par email',
    },
    create: {
      name: 'Agence Starter',
      price: 49.00,
      prospectsLimit: 50,
      usersLimit: 5,
      propertiesLimit: 10,
      features: 'Gestion de 50 prospects, 10 propriétés, 5 utilisateurs, Accès aux fonctionnalités de base, Support par email',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Agence Pro' },
    update: {
        price: 99.00,
        prospectsLimit: -1,
        usersLimit: -1,
        propertiesLimit: 100,
        features: 'Gestion illimitée de prospects, 100 propriétés, utilisateurs illimités, Rapports avancés, Intégration CRM, Support prioritaire',
    },
    create: {
      name: 'Agence Pro',
      price: 99.00,
      prospectsLimit: -1,
      usersLimit: -1,
      propertiesLimit: 100,
      features: 'Gestion illimitée de prospects, 100 properties, utilisateurs illimités, Rapports avancés, Intégration CRM, Support prioritaire',
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Agence Entreprise' },
    update: {
        price: 0.00, // Price on quote
        prospectsLimit: -1,
        usersLimit: -1,
        propertiesLimit: -1,
        features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l\'équipe',
    },
    create: {
      name: 'Agence Entreprise',
      price: 0.00, // Price on quote
      prospectsLimit: -1,
      usersLimit: -1,
      propertiesLimit: -1,
      features: 'Accès complet à toutes les fonctionnalités, Support dédié 24/7, Personnalisation et intégration sur mesure, Formation de l\'équipe',
    },
  });

  console.log('Plans upserted.');
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