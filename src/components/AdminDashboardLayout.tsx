import React, { useState } from 'react';
import { FaTachometerAlt, FaBuilding, FaDollarSign, FaUsers, FaTicketAlt, FaSignOutAlt, FaUserCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown } from 'react-bootstrap';
import Image from 'next/image';
import styles from '../styles/NewDashboard.module.css';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const userName = session?.user?.name || 'Admin User';

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
          <Link href="/admin/dashboard" className={styles.sidebarLink}>
            <FaTachometerAlt /> <span>Tableau de bord</span>
          </Link>
          <Link href="/admin/agencies" className={styles.sidebarLink}>
            <FaBuilding /> <span>Agences</span>
          </Link>
          <Link href="/admin/plans" className={styles.sidebarLink}>
            <FaDollarSign /> <span>Plans</span>
          </Link>
          <Link href="/admin/subscriptions" className={styles.sidebarLink}>
            <FaUsers /> <span>Abonnements</span>
          </Link>
          <Link href="/admin/tickets" className={styles.sidebarLink}>
            <FaTicketAlt /> <span>Tickets</span>
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Dropdown drop="up">
            <Dropdown.Toggle variant="transparent" id="dropdown-user" className={styles.userMenu}>
              <FaUserCircle size={24} />
              {!isSidebarCollapsed && <span className="ms-2">{userName}</span>}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => signOut({ callbackUrl: '/' })}>
                <FaSignOutAlt className="me-2" />
                Déconnexion
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <div className={styles.header}>
          <button onClick={toggleSidebar} className={styles.sidebarMobileToggle}>
            {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
          {/* Header content can go here, like a search bar */}
        </div>
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
