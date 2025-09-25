import React from 'react';
import { FaTachometerAlt, FaUsers, FaBuilding, FaDollarSign, FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import styles from '@/styles/Admin.module.css';
import { Button } from 'react-bootstrap';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`${styles.layout} d-flex`}>
      <div className={styles.sidebar}>
        <h4 className="mb-4">Admin Panel</h4>
        <nav className="d-flex flex-column">
          <Link href="/admin/dashboard" className={styles.sidebarLink}>
              <FaTachometerAlt /> Tableau de bord
          </Link>
          <Link href="/admin/agencies" className={styles.sidebarLink}>
              <FaBuilding /> Agences
          </Link>
          <Link href="/admin/plans" className={styles.sidebarLink}>
              <FaDollarSign /> Plans
          </Link>
          <Link href="/admin/subscriptions" className={styles.sidebarLink}>
              <FaUsers /> Abonnements
          </Link>
          <Link href="/admin/tickets" className={styles.sidebarLink}>
              <FaTicketAlt /> Tickets
          </Link>
        </nav>
        <div className="mt-auto">
          <Button variant="outline-primary" className="w-100" onClick={() => signOut({ callbackUrl: '/' })}>
            Déconnexion
          </Button>
        </div>
      </div>
      <main className={`${styles.content} flex-grow-1`}>
        {children}
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
