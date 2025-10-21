import React from 'react';
import Link from 'next/link';
import { FaPaperPlane, FaRocket } from 'react-icons/fa';
import styles from '@/styles/ModernContact.module.css';

const ContactSection = () => {
  return (
    <section id="contact" className={styles.section}>
      <div className="modern-container">
        <div className={styles.sectionHeader}>
          <h2 className="modern-section-title">Prêt à commencer ?</h2>
          <p className="modern-section-subtitle">
            Inscrivez-vous pour un essai gratuit ou contactez-nous pour en savoir plus sur nos solutions
          </p>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.contactForm}>
            <form className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Votre nom</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Ex: Jean Dupont"
                    className="modern-input"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Ex: jean@agence.com"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Votre message</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="modern-input"
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>
                  <FaPaperPlane />
                  Envoyer le message
                </button>
                <Link href="/register" className={styles.btnSecondary}>
                  <FaRocket />
                  S&apos;inscrire gratuitement
                </Link>
              </div>
            </form>
          </div>

          <div className={styles.ctaBox}>
            <div className={styles.ctaContent}>
              <div className={styles.ctaIcon}>
                <FaRocket size={40} />
              </div>
              <h3 className={styles.ctaTitle}>Essai gratuit de 14 jours</h3>
              <p className={styles.ctaText}>
                Démarrez dès aujourd'hui sans risque. Aucune carte de crédit requise.
              </p>
              <ul className={styles.ctaFeatures}>
                <li>✓ Configuration en 5 minutes</li>
                <li>✓ Support client prioritaire</li>
                <li>✓ Accès à toutes les fonctionnalités</li>
                <li>✓ Annulation à tout moment</li>
              </ul>
              <Link href="/register" className={styles.ctaButton}>
                Démarrer maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
