import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FaRocket } from 'react-icons/fa';
import styles from '@/styles/Landing.module.css';

const Header = () => {
  const { data: session, status } = useSession();

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    if (session.user.role === 'ADMIN') return '/admin/dashboard';
    if (session.user.agencyId) return '/agency/dashboard';
    return '/';
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/" legacyBehavior>
          <a>
            <FaRocket className="me-2" size={24} />
            LeadEstate
          </a>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/#services" legacyBehavior><a>Services</a></Link>
        <Link href="/#pricing" legacyBehavior><a>Tarifs</a></Link>
        <Link href="/#features" legacyBehavior><a>Fonctionnalités</a></Link>
        <Link href="/#about" legacyBehavior><a>À propos</a></Link>
        <Link href="/#contact" legacyBehavior><a>Contact</a></Link>
      </nav>
      <div>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'unauthenticated' && (
          <>
            <Link href="/register" legacyBehavior><a className="btn-outline-primary me-2">S'enregistrer</a></Link>
            <Link href="/login" legacyBehavior><a className="btn-primary">Se connecter</a></Link>
          </>
        )}
        {status === 'authenticated' && (
          <>
            <Link href={getDashboardUrl()} legacyBehavior><a className="btn-primary me-2">Tableau de bord</a></Link>
            <button onClick={() => signOut()} className="btn-outline-secondary">Déconnexion</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
