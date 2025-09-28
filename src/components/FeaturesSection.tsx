import React from 'react';
import { FaFileImport, FaStream, FaCreditCard, FaChartLine, FaHome, FaUserLock } from 'react-icons/fa';
import styles from '@/styles/Landing.module.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaFileImport size={30} className="mb-3" />,
      title: 'Ajout de prospects simplifié',
      description: 'Importez des listes depuis CSV/Google Sheets, ou ajoutez des prospects manuellement en quelques clics.',
    },
    {
      icon: <FaStream size={30} className="mb-3" />,
      title: 'Pipeline de vente visuel',
      description: 'Gérez votre pipeline avec une vue Kanban claire qui montre les prospects à chaque étape du processus de vente.',
    },
    {
      icon: <FaCreditCard size={30} className="mb-3" />,
      title: 'Gestion des abonnements intégrée',
      description: 'Les agences peuvent gérer leurs abonnements, utilisateurs, et permissions directement depuis leur tableau de bord.',
    },
    {
      icon: <FaChartLine size={30} className="mb-3" />,
      title: 'Tableau de bord analytique',
      description: 'Prenez des décisions basées sur les données avec des statistiques détaillées sur vos taux de conversion et performances.',
    },
    {
      icon: <FaHome size={30} className="mb-3" />,
      title: 'Gestion des propriétés',
      description: 'Liez un prospect à des propriétés spécifiques, suivez les interactions et l\'historique des visites.',
    },
    {
      icon: <FaUserLock size={30} className="mb-3" />,
      title: 'Gestion des utilisateurs et permissions',
      description: 'Contrôlez qui a accès à quoi avec un système de permissions granulaires par utilisateur au sein de chaque agence.',
    }
  ];

  return (
    <section id="features" className={styles.section}>
      <h2 className={styles.sectionTitle}>Des fonctionnalités pensées pour vous</h2>
      <p className="lead text-muted">Des outils puissants pour une gestion sans effort.</p>
      <div className="d-flex flex-wrap justify-content-center">
        {features.map((feature, index) => (
          <div className={styles.featureItem} key={index}>
            {feature.icon}
            <h5>{feature.title}</h5>
            <p className="text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
