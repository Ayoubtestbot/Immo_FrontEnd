import React, { useState } from 'react';
import { FiGrid, FiUsers, FiArchive, FiTag, FiSettings, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { UserRole } from '@prisma/client';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
  );

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className='sidebar'>
        <div className="sidebar-header">
          <h4 className="full-logo">LeadEstate</h4>
          <button onClick={toggleSidebar} className="sidebar-toggle">
            <FiMenu />
          </button>
        </div>
        <nav className="sidebar-nav">
          <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Tableau de bord') : <></>}>
            <Link href="/agency/dashboard" className="sidebar-link">
              <FiGrid /> <span>Tableau de bord</span>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Prospects') : <></>}>
            <Link href="/agency/leads" className="sidebar-link">
              <FiUsers /> <span>Prospects</span>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Propriétés') : <></>}>
            <Link href="/agency/properties" className="sidebar-link">
              <FiArchive /> <span>Propriétés</span>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Calendrier') : <></>}>
            <Link href="/agency/calendar" className="sidebar-link">
              <FiGrid /> <span>Calendrier</span>
            </Link>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Tickets') : <></>}>
            <Link href="/agency/tickets" className="sidebar-link">
              <FiTag /> <span>Tickets</span>
            </Link>
          </OverlayTrigger>
          {session?.user?.role === UserRole.AGENCY_OWNER && (
            <>
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Équipe') : <></>}>
                <Link href="/agency/users" className="sidebar-link">
                  <FiUsers /> <span>Équipe</span>
                </Link>
              </OverlayTrigger>
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Paramètres') : <></>}>
                <Link href="/agency/settings" className="sidebar-link">
                  <FiSettings /> <span>Paramètres</span>
                </Link>
              </OverlayTrigger>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <Dropdown drop="up">
            <Dropdown.Toggle variant="transparent" id="dropdown-user" className="user-menu">
                <FiUser size={24} />
                <span className="ms-2">{session?.user?.name}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => signOut({ callbackUrl: '/' })}>
                <FiLogOut className="me-2" />
                Déconnexion
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <button onClick={toggleSidebar} className="sidebar-mobile-toggle">
            <FiMenu />
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

export default DashboardLayout;
