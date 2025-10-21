import React from 'react';
import Link from 'next/link';
import { FaRocket, FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import styles from '@/styles/ModernFooter.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="modern-container">
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <FaRocket />
              </div>
              <span className={styles.logoText}>LeadEstate</span>
            </div>
            <p className={styles.brandDescription}>
              La plateforme tout-en-un pour les agences immobilières modernes.
              Gérez vos prospects, propriétés et ventes avec efficacité.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Navigation</h4>
              <ul className={styles.linkList}>
                <li><a href="#services" className={styles.link}>Services</a></li>
                <li><a href="#pricing" className={styles.link}>Tarifs</a></li>
                <li><a href="#features" className={styles.link}>Fonctionnalités</a></li>
                <li><a href="#about" className={styles.link}>À propos</a></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Légal</h4>
              <ul className={styles.linkList}>
                <li><a href="#" className={styles.link}>Mentions légales</a></li>
                <li><a href="#" className={styles.link}>Politique de confidentialité</a></li>
                <li><a href="#" className={styles.link}>CGU</a></li>
                <li><a href="#" className={styles.link}>Cookies</a></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Support</h4>
              <ul className={styles.linkList}>
                <li><a href="#" className={styles.link}>Centre d'aide</a></li>
                <li><a href="#contact" className={styles.link}>Contact</a></li>
                <li><a href="#" className={styles.link}>Documentation</a></li>
                <li><a href="#" className={styles.link}>FAQ</a></li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Contact</h4>
              <ul className={styles.contactList}>
                <li className={styles.contactItem}>
                  <strong>Email:</strong> contact@leadestate.com
                </li>
                <li className={styles.contactItem}>
                  <strong>Téléphone:</strong> +33 1 23 45 67 89
                </li>
                <li className={styles.contactItem}>
                  <strong>Horaires:</strong> Lun-Ven 9h-18h
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} LeadEstate. Tous droits réservés.
          </p>
          <p className={styles.madeWith}>
            Conçu avec ❤️ pour les professionnels de l'immobilier
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
