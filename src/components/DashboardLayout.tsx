import React, { useState } from 'react';
import { FiGrid, FiUsers, FiArchive, FiTag, FiSettings, FiLogOut, FiUser, FiMenu, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown } from 'react-bootstrap';
import { UserRole } from '@prisma/client';
import styles from '../styles/NewDashboard.module.css';
import Image from 'next/image';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={styles.layout}>
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <Image
            src={isSidebarCollapsed ? "/logo-small.png" : "/logo.png"}
            alt="LeadEstate"
            width={isSidebarCollapsed ? 40 : 120}
            height={40}
            className={styles.logo}
          />
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/agency/dashboard" className={styles.sidebarLink}>
            <FiGrid /> <span>Tableau de bord</span>
          </Link>
          <Link href="/agency/leads" className={styles.sidebarLink}>
            <FiUsers /> <span>Prospects</span>
          </Link>
          <Link href="/agency/properties" className={styles.sidebarLink}>
            <FiArchive /> <span>Propriétés</span>
          </Link>
          <Link href="/agency/calendar" className={styles.sidebarLink}>
            <FiCalendar /> <span>Calendrier</span>
          </Link>
          <Link href="/agency/tickets" className={styles.sidebarLink}>
            <FiTag /> <span>Tickets</span>
          </Link>
          {session?.user?.role === UserRole.AGENCY_OWNER && (
            <>
              <Link href="/agency/users" className={styles.sidebarLink}>
                <FiUsers /> <span>Équipe</span>
              </Link>
              <Link href="/agency/settings" className={styles.sidebarLink}>
                <FiSettings /> <span>Paramètres</span>
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <div className={styles.header}>
          <button onClick={toggleSidebar} className={styles.sidebarMobileToggle}>
            <FiMenu />
          </button>
          <div className="ms-auto d-flex align-items-center">
            <Dropdown align="end">
              <Dropdown.Toggle variant="transparent" id="dropdown-user-header" className="d-flex align-items-center">
                <FiUser size={20} className="me-2" />
                <span>{session?.user?.name}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} href="/agency/settings">
                    <FiSettings className="me-2" />
                    Paramètres
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => signOut({ callbackUrl: '/' })}>
                    <FiLogOut className="me-2" />
                    Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;