import React from 'react';
import styles from '@/styles/Landing.module.css';
import Link from 'next/link';

const ContactSection = () => {
  return (
    <section id="contact" className={styles.section}>
      <h2 className={styles.sectionTitle}>Prêt à commencer ?</h2>
      <p className="lead text-muted">Inscrivez-vous pour un essai gratuit ou contactez-nous pour en savoir plus.</p>
      <div className="d-flex justify-content-center">
        <form className="p-4 m-2 card" style={{ flex: '1 1 500px', maxWidth: '700px' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Votre nom" className={styles.input} style={{ flex: 1 }} />
            <input type="email" placeholder="Adresse email" className={styles.input} style={{ flex: 1 }} />
          </div>
          <textarea rows={4} placeholder="Comment pouvons-nous vous aider ?" className={styles.input} style={{ height: '120px' }}></textarea>
          <div className="d-flex justify-content-center mt-3">
            <button type="submit" className="btn btn-primary me-2">Envoyer le message</button>
            <Link href="/register" className="btn btn-outline-primary">S&apos;inscrire</Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
