import React from 'react';
import Image from 'next/image';
import { FaLightbulb, FaCheckCircle, FaHandshake, FaShieldAlt } from 'react-icons/fa';
import styles from '@/styles/ModernSections.module.css';

const AboutSection = () => {
  const values = [
    {
      icon: <FaLightbulb />,
      title: 'Innovation',
      description: 'Nous nous efforçons de toujours être à la pointe de la technologie.',
      color: '#667eea',
    },
    {
      icon: <FaCheckCircle />,
      title: 'Simplicité',
      description: 'Nous croyons en des outils puissants mais simples à utiliser.',
      color: '#10b981',
    },
    {
      icon: <FaHandshake />,
      title: 'Partenariat',
      description: 'Nous considérons nos clients comme des partenaires.',
      color: '#f59e0b',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Intégrité',
      description: 'Nous agissons avec honnêteté et transparence.',
      color: '#ef4444',
    },
  ];

  return (
    <section id="about" className={styles.section}>
      <div className="modern-container">
        <div className={styles.aboutContainer}>
          <div className={styles.aboutImage}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/hero_section_image.jpg" 
                alt="About LeadEstate" 
                width={600} 
                height={500} 
                className={styles.aboutImg}
              />
              <div className={styles.imageBadge}>
                <div className={styles.badgeNumber}>500+</div>
                <div className={styles.badgeText}>Agences satisfaites</div>
              </div>
            </div>
          </div>

          <div className={styles.aboutContent}>
            <h2 className={styles.aboutTitle}>
              À propos de <span className={styles.aboutTitleGradient}>LeadEstate</span>
            </h2>
            <p className={styles.aboutLead}>
              Notre mission est de fournir aux agences immobilières les outils dont elles ont besoin pour prospérer à l&apos;ère numérique.
            </p>
            
            <div className={styles.aboutText}>
              <h4 className={styles.aboutSubtitle}>Notre Solution</h4>
              <p>
                LeadEstate est une plateforme tout-en-un conçue pour simplifier la gestion des prospects, des propriétés et des ventes. Nous centralisons vos opérations pour vous faire gagner du temps et vous aider à conclure plus de transactions.
              </p>
            </div>

            <h4 className={styles.aboutSubtitle}>Nos Valeurs</h4>
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div className={styles.valueCard} key={index}>
                  <div className={styles.valueIcon} style={{ color: value.color }}>
                    {value.icon}
                  </div>
                  <div>
                    <h5 className={styles.valueTitle}>{value.title}</h5>
                    <p className={styles.valueDescription}>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
