import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FaRocket, FaBars, FaTimes } from 'react-icons/fa';
import styles from '@/styles/ModernHeader.module.css';

const Header = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    if (session.user.role === 'ADMIN') return '/admin/dashboard';
    if (session.user.agencyId) return '/agency/dashboard';
    return '/';
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>
              <FaRocket size={24} />
            </div>
            <span className={styles.logoText}>LeadEstate</span>
          </Link>
        </div>

        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <Link href="/#services" className={styles.navLink}>Services</Link>
          <Link href="/#pricing" className={styles.navLink}>Tarifs</Link>
          <Link href="/#features" className={styles.navLink}>Fonctionnalités</Link>
          <Link href="/#about" className={styles.navLink}>À propos</Link>
          <Link href="/#contact" className={styles.navLink}>Contact</Link>
        </nav>

        <div className={`${styles.authButtons} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          {status === 'loading' && (
            <div className={styles.loadingSpinner}></div>
          )}
          {status === 'unauthenticated' && (
            <>
              <Link href="/register" className={styles.btnSecondary}>
                S&apos;enregistrer
              </Link>
              <Link href="/login" className={styles.btnPrimary}>
                Se connecter
              </Link>
            </>
          )}
          {status === 'authenticated' && (
            <>
              <Link href={getDashboardUrl()} className={styles.btnPrimary}>
                Tableau de bord
              </Link>
              <button onClick={() => signOut()} className={styles.btnSecondary}>
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
