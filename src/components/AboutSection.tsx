import React from 'react';
import Image from 'next/image';
import styles from '@/styles/Landing.module.css';

const AboutSection = () => {
  return (
    <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <Image src="/hero_section_image.jpg" alt="About LeadEstate" width={600} height={400} className="img-fluid rounded" />
          </div>
          <div className="col-lg-6">
            <h2 className={styles.sectionTitle}>À propos de LeadEstate</h2>
            <p className="lead text-muted">Notre mission est de fournir aux agences immobilières les outils dont elles ont besoin pour prospérer à l&apos;ère numérique.</p>
            <h4>Notre Solution</h4>
            <p>LeadEstate est une plateforme tout-en-un conçue pour simplifier la gestion des prospects, des propriétés et des ventes. Nous centralisons vos opérations pour vous faire gagner du temps et vous aider à conclure plus de transactions.</p>
            <h4>Nos Valeurs</h4>
            <ul className={styles.valuesList}>
              <li><strong>Innovation:</strong> <span>Nous nous efforçons de toujours être à la pointe de la technologie.</span></li>
              <li><strong>Simplicité:</strong> <span>Nous croyons en des outils puissants mais simples à utiliser.</span></li>
              <li><strong>Partenariat:</strong> <span>Nous considérons nos clients comme des partenaires.</span></li>
              <li><strong>Intégrité:</strong> <span>Nous agissons avec honnêteté et transparence.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
