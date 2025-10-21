import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaRocket, FaChartLine, FaUsers, FaCheck } from 'react-icons/fa';
import styles from '@/styles/ModernHero.module.css';

const HeroSection = () => {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push('/register');
  };

  return (
    <section className={styles.hero}>
      <div className={styles.gradientBackground}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <div className={styles.badge}>
              <FaRocket size={14} />
              <span>Plateforme CRM Immobilier #1</span>
            </div>
            
            <h1 className={styles.title}>
              Transformez vos <span className={styles.gradient}>prospects</span> en <span className={styles.gradient}>clients</span>
            </h1>
            
            <p className={styles.subtitle}>
              LeadEstate est la plateforme tout-en-un qui vous aide à gérer vos prospects, propriétés et ventes avec une efficacité redoutable.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <FaCheck className={styles.checkIcon} />
                <span>Essai gratuit de 14 jours</span>
              </div>
              <div className={styles.feature}>
                <FaCheck className={styles.checkIcon} />
                <span>Aucune carte de crédit requise</span>
              </div>
              <div className={styles.feature}>
                <FaCheck className={styles.checkIcon} />
                <span>Configuration en 5 minutes</span>
              </div>
            </div>

            <div className={styles.buttons}>
              <button className={styles.btnPrimary} onClick={handleStartTrial}>
                Commencez votre essai gratuit
                <FaRocket size={16} />
              </button>
              <a href="#features" className={styles.btnSecondary}>
                Découvrir les fonctionnalités
              </a>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statIcon}>
                  <FaUsers />
                </div>
                <div>
                  <div className={styles.statNumber}>500+</div>
                  <div className={styles.statLabel}>Agences actives</div>
                </div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div>
                  <div className={styles.statNumber}>98%</div>
                  <div className={styles.statLabel}>Taux de satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.imageContent}>
            <div className={styles.imageWrapper}>
              <div className={styles.floatingCard1}>
                <div className={styles.cardIcon}>📊</div>
                <div>
                  <div className={styles.cardTitle}>+45%</div>
                  <div className={styles.cardSubtitle}>Conversions</div>
                </div>
              </div>
              <div className={styles.floatingCard2}>
                <div className={styles.cardIcon}>⚡</div>
                <div>
                  <div className={styles.cardTitle}>-60%</div>
                  <div className={styles.cardSubtitle}>Temps de gestion</div>
                </div>
              </div>
              <Image 
                src="/hero_section_image.jpg" 
                alt="Real Estate Dashboard" 
                width={700} 
                height={500} 
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
