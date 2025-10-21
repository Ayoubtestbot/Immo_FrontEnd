import React from 'react';
import { FaFileImport, FaStream, FaCreditCard, FaChartLine, FaHome, FaUserLock } from 'react-icons/fa';
import styles from '@/styles/ModernSections.module.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaFileImport />,
      title: 'Ajout de prospects simplifié',
      description: 'Importez des listes depuis CSV/Google Sheets, ou ajoutez des prospects manuellement en quelques clics.',
    },
    {
      icon: <FaStream />,
      title: 'Pipeline de vente visuel',
      description: 'Gérez votre pipeline avec une vue Kanban claire qui montre les prospects à chaque étape du processus de vente.',
    },
    {
      icon: <FaCreditCard />,
      title: 'Gestion des abonnements intégrée',
      description: 'Les agences peuvent gérer leurs abonnements, utilisateurs, et permissions directement depuis leur tableau de bord.',
    },
    {
      icon: <FaChartLine />,
      title: 'Tableau de bord analytique',
      description: 'Prenez des décisions basées sur les données avec des statistiques détaillées sur vos taux de conversion et performances.',
    },
    {
      icon: <FaHome />,
      title: 'Gestion des propriétés',
      description: 'Liez un prospect à des propriétés spécifiques, suivez les interactions et l\'historique des visites.',
    },
    {
      icon: <FaUserLock />,
      title: 'Gestion des utilisateurs et permissions',
      description: 'Contrôlez qui a accès à quoi avec un système de permissions granulaires par utilisateur au sein de chaque agence.',
    }
  ];

  return (
    <section id="features" className={`${styles.section} ${styles.featuresSection}`}>
      <div className="modern-container">
        <div className={styles.sectionHeader}>
          <h2 className="modern-section-title">Des fonctionnalités pensées pour vous</h2>
          <p className="modern-section-subtitle">
            Des outils puissants pour une gestion sans effort de votre activité immobilière
          </p>
        </div>

        <div className="modern-grid-3">
          {features.map((feature, index) => (
            <div 
              className={styles.featureCard} 
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="modern-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
