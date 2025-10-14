import React, { useState } from 'react';
import { FiGrid, FiUsers, FiArchive, FiDollarSign, FiTag, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown } from 'react-bootstrap';
import styles from '../styles/NewDashboard.module.css';
import Image from 'next/image';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navItems = [
    { href: '/admin/dashboard', icon: <FiGrid />, label: 'Tableau de bord' },
    { href: '/admin/agencies', icon: <FiUsers />, label: 'Agences' },
    { href: '/admin/plans', icon: <FiDollarSign />, label: 'Plans' },
    { href: '/admin/subscriptions', icon: <FiArchive />, label: 'Abonnements' },
    { href: '/admin/tickets', icon: <FiTag />, label: 'Tickets' },
  ];

  return (
    <div className={styles.layout}>
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <Image
            src={isSidebarCollapsed ? "/Logo_Only.png" : "/Logo_page.png"}
            alt="LeadEstate"
            width={isSidebarCollapsed ? 32 : 130}
            height={32}
            className={styles.logo}
          />
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`${styles.sidebarLink} ${router.pathname === item.href ? styles.active : ''}`}>
              {item.icon}
              <span>{item.label}</span>
              <span className={styles.tooltip}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.userProfile}>
            <Dropdown drop="up">
                <Dropdown.Toggle as="div" className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <div className={styles.userProfileImg}>
                        {session?.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'Admin'} width={40} height={40} style={{ borderRadius: '50%' }} />
                        ) : (
                            <FiUser />
                        )}
                    </div>
                    <div className={styles.userProfileInfo}>
                        <span>{session?.user?.name}</span>
                        <small>{session?.user?.email}</small>
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
                    <Dropdown.Item onClick={() => signOut({ callbackUrl: '/' })}>
                        <FiLogOut className="me-2" />
                        Déconnexion
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
      </div>

      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <div className={styles.header}>
          <button onClick={toggleSidebar} className={styles.sidebarMobileToggle}>
            <FiMenu />
          </button>
        </div>
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;