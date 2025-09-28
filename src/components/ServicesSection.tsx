import React from 'react';
import { FaUsers, FaBuilding, FaTachometerAlt, FaUserShield } from 'react-icons/fa';
import styles from '@/styles/Landing.module.css';

const ServicesSection = () => {
  const services = [
    {
      icon: <FaUsers size={40} className="mb-3" />,
      title: 'Gestion des prospects',
      description: 'Suivez vos prospects à chaque étape, de la prise de contact à la conversion, avec un suivi détaillé des statuts et des interactions.',
    },
    {
      icon: <FaBuilding size={40} className="mb-3" />,
      title: 'Gestion des propriétés',
      description: 'Liez facilement des prospects à des biens immobiliers spécifiques et suivez toutes les interactions et l\'intérêt pour chaque propriété.',
    },
    {
      icon: <FaTachometerAlt size={40} className="mb-3" />,
      title: 'Tableau de bord pour agences',
      description: 'Une vue d\'ensemble claire de la performance de votre agence, de vos agents et de votre portefeuille de propriétés.',
    },
    {
      icon: <FaUserShield size={40} className="mb-3" />,
      title: 'Backoffice administrateur',
      description: 'Gérez les abonnements, les agences, et les performances globales de la plateforme depuis un backoffice centralisé.',
    },
  ];

  return (
    <section id="services" className={styles.section}>
      <h2 className={styles.sectionTitle}>Nos Services</h2>
      <p className="lead text-muted">Tout ce dont vous avez besoin pour faire grandir votre agence.</p>
      <div className="d-flex flex-wrap justify-content-center">
        {services.map((service, index) => (
          <div className="p-4 m-2" style={{ flex: '1 1 300px', maxWidth: '350px' }} key={index}>
            {React.cloneElement(service.icon, { className: "mb-3" })}
            <h5 className="mb-3">{service.title}</h5>
            <p className="text-muted">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
