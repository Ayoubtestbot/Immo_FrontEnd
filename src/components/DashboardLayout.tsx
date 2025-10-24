import React, { useState } from 'react';
import { FiGrid, FiUsers, FiArchive, FiTag, FiSettings, FiLogOut, FiUser, FiMenu, FiCalendar, FiBell, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown, Badge } from 'react-bootstrap';
import { UserRole } from '@prisma/client';
import styles from '../styles/ModernDashboard.module.css';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '@/contexts/NotificationsContext';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 968) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleNotificationDropdownToggle = (isOpen: boolean) => {
    if (isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const navItems = [
    { href: '/agency/dashboard', icon: <FiGrid />, label: 'Tableau de bord' },
    { href: '/agency/leads', icon: <FiUsers />, label: 'Prospects' },
    { href: '/agency/properties', icon: <FiArchive />, label: 'Propriétés' },
    { href: '/agency/projects', icon: <FiTag />, label: 'Projets' },
    { href: '/agency/calendar', icon: <FiCalendar />, label: 'Calendrier' },
    { href: '/agency/tickets', icon: <FiTag />, label: 'Tickets' },
    { href: '/agency/report', icon: <FiTrendingUp />, label: 'Rapport' },
  ];

  const adminNavItems = [
    { href: '/agency/users', icon: <FiUsers />, label: 'Équipe' },
    { href: '/agency/settings', icon: <FiSettings />, label: 'Paramètres' },
    { href: '/agency/settings/sources', icon: <FiTag />, label: 'Sources' },
  ];

  return (
    <div className={styles.layout}>
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''} ${isMobileSidebarOpen ? styles.sidebarOpen : ''}`}>
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
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.sidebarLink} ${router.pathname === item.href ? styles.active : ''}`}
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              <span className={styles.tooltip}>{item.label}</span>
            </Link>
          ))}

          {session?.user?.role === UserRole.AGENCY_OWNER && (
            <>
              <div className={styles.sectionDivider}></div>
              {adminNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`${styles.sidebarLink} ${router.pathname === item.href ? styles.active : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <span className={styles.tooltip}>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className={styles.userProfile}>
          <Dropdown drop="up">
            <Dropdown.Toggle as="div" className="d-flex align-items-center">
              <div className={styles.userProfileImg}>
                {session?.user?.image ? (
                  <Image src={session.user.image} alt={session.user.name || 'User'} width={40} height={40} style={{ borderRadius: '50%' }} />
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
          <button onClick={handleToggle} className={styles.sidebarMobileToggle}>
            <FiMenu />
          </button>
          <div className="ms-auto d-flex align-items-center">
            <Dropdown onToggle={handleNotificationDropdownToggle} align="end">
              <Dropdown.Toggle variant="transparent" id="dropdown-notifications" className="position-relative">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                    {unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Notifications</Dropdown.Header>
                <div className={styles.notificationMenu}>
                  {notifications.map(notification => (
                    <Dropdown.Item key={notification.id} as={Link} href={notification.link || '#'} className={!notification.read ? 'fw-bold' : ''}>
                      <div>{notification.message}</div>
                      <small className="text-muted">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                      </small>
                    </Dropdown.Item>
                  ))}
                  {notifications.length === 0 && <Dropdown.Item disabled>Vous n&apos;avez aucune notification</Dropdown.Item>}
                </div>
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
