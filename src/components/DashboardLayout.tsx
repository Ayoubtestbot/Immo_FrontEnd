import React from 'react';
import { FaTachometerAlt, FaUsers, FaBuilding, FaTicketAlt, FaCog } from 'react-icons/fa'; // Added FaCog
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import styles from '@/styles/Agency.module.css';
import { Button } from 'react-bootstrap';
import { UserRole } from '@prisma/client';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  return (
    <div className={`${styles.layout} d-flex`}>
      <div className={styles.sidebar}>
        <h4 className="mb-4">LeadEstate</h4>
        <nav className="flex-column">
          <Link href="/agency/dashboard" className={styles.sidebarLink}>
              <FaTachometerAlt /> Tableau de bord
          </Link>
          <Link href="/agency/leads" className={styles.sidebarLink}>
              <FaUsers /> Prospects
          </Link>
          <Link href="/agency/properties" className={styles.sidebarLink}>
              <FaBuilding /> Propriétés
          </Link>
          <Link href="/agency/tickets" className={styles.sidebarLink}>
              <FaTicketAlt /> Tickets
          </Link>
          {session?.user?.role === UserRole.AGENCY_OWNER && (
            <>
              <Link href="/agency/users" className={styles.sidebarLink}>
                  <FaUsers /> Membres de l'équipe
              </Link>
              <Link href="/agency/settings" className={styles.sidebarLink}> {/* New link */}
                  <FaCog /> Paramètres
              </Link>
            </>
          )}
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

export default DashboardLayout;
