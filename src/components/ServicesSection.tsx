import React from 'react';
import { FaUsers, FaBuilding, FaTachometerAlt, FaUserShield } from 'react-icons/fa';
import styles from '@/styles/ModernSections.module.css';

const ServicesSection = () => {
  const services = [
    {
      icon: <FaUsers />,
      title: 'Gestion des prospects',
      description: 'Suivez vos prospects à chaque étape, de la prise de contact à la conversion, avec un suivi détaillé des statuts et des interactions.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <FaBuilding />,
      title: 'Gestion des propriétés',
      description: 'Liez facilement des prospects à des biens immobiliers spécifiques et suivez toutes les interactions et l\'intérêt pour chaque propriété.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <FaTachometerAlt />,
      title: 'Tableau de bord pour agences',
      description: 'Une vue d\'ensemble claire de la performance de votre agence, de vos agents et de votre portefeuille de propriétés.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <FaUserShield />,
      title: 'Backoffice administrateur',
      description: 'Gérez les abonnements, les agences, et les performances globales de la plateforme depuis un backoffice centralisé.',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ];

  return (
    <section id="services" className={styles.section}>
      <div className="modern-container">
        <div className={styles.sectionHeader}>
          <h2 className="modern-section-title">Nos Services</h2>
          <p className="modern-section-subtitle">
            Tout ce dont vous avez besoin pour faire grandir votre agence immobilière
          </p>
        </div>

        <div className="modern-grid-2">
          {services.map((service, index) => (
            <div 
              className={styles.serviceCard} 
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.serviceIcon} style={{ background: service.gradient }}>
                {service.icon}
              </div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              <div className={styles.serviceFooter}>
                <span className={styles.learnMore}>En savoir plus →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
