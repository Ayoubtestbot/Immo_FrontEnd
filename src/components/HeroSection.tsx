import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '@/styles/Landing.module.css';

const HeroSection = () => {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push('/register');
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Transformez vos prospects en clients</h1>
          <p className={styles.heroSubtitle}>
            LeadEstate est la plateforme tout-en-un qui vous aide à gérer vos prospects, propriétés et ventes avec une efficacité redoutable.
          </p>
          <div className="d-flex">
            <button className="btn-primary my-2 me-2 equal-width-btn" onClick={handleStartTrial}>Commencez votre essai gratuit</button>
            <a href="#features" className="btn-secondary my-2 equal-width-btn">Découvrir les fonctionnalités</a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image src="/hero_section_image.jpg" alt="Real Estate" width={700} height={400} style={{ borderRadius: '8px' }} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;