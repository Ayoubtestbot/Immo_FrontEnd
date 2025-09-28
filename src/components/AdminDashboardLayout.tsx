import React, { useState } from 'react';
import { FaTachometerAlt, FaBuilding, FaDollarSign, FaUsers, FaTicketAlt, FaSignOutAlt, FaUserCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown, OverlayTrigger, Tooltip, Nav } from 'react-bootstrap';
import Image from 'next/image';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
  );

  const userName = session?.user?.name || 'Admin User';
  const userInitials = userName.split(' ').map(n => n[0]).join('');

  return (
    <div className={`admin-dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar">
        <div>
          <div className="sidebar-header">
            <Link href="/admin/dashboard" legacyBehavior>
              <a className="d-flex align-items-center text-decoration-none">
                <Image src={isSidebarCollapsed ? "/logo-small.png" : "/logo.png"} alt="LeadEstate" width={isSidebarCollapsed ? 40 : 120} height={40} />
              </a>
            </Link>
            <button onClick={toggleSidebar} className="sidebar-toggle">
              {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
          <Nav className="flex-column sidebar-nav">
            <Nav.Link as={Link} href="/admin/dashboard" className="sidebar-link">
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Tableau de bord') : <></>}>
                <><FaTachometerAlt /> <span className="nav-text">Tableau de bord</span></>
              </OverlayTrigger>
            </Nav.Link>
            <Nav.Link as={Link} href="/admin/agencies" className="sidebar-link">
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Agences') : <></>}>
                <><FaBuilding /> <span className="nav-text">Agences</span></>
              </OverlayTrigger>
            </Nav.Link>
            <Nav.Link as={Link} href="/admin/plans" className="sidebar-link">
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Plans') : <></>}>
                <><FaDollarSign /> <span className="nav-text">Plans</span></>
              </OverlayTrigger>
            </Nav.Link>
            <Nav.Link as={Link} href="/admin/subscriptions" className="sidebar-link">
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Abonnements') : <></>}>
                <><FaUsers /> <span className="nav-text">Abonnements</span></>
              </OverlayTrigger>
            </Nav.Link>
            <Nav.Link as={Link} href="/admin/tickets" className="sidebar-link">
              <OverlayTrigger placement="right" overlay={isSidebarCollapsed ? renderTooltip('Tickets') : <></>}>
                <><FaTicketAlt /> <span className="nav-text">Tickets</span></>
              </OverlayTrigger>
            </Nav.Link>
          </Nav>
        </div>
        <div className="sidebar-footer">
          <Dropdown drop="up">
            <Dropdown.Toggle variant="transparent" id="dropdown-user" className="user-menu">
              <div className="user-avatar">{userInitials}</div>
              {!isSidebarCollapsed && <span className="ms-2 nav-text">{userName}</span>}
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
      <div className="main-content">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
