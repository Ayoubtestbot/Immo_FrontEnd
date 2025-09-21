import React from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaBuilding, FaDollarSign, FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="bg-dark text-white vh-100 p-3 d-flex flex-column">
          <h4 className="mb-4">Admin Panel</h4>
          <Nav className="flex-column">
            <Link href="/admin/dashboard" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2 text-white">
                <FaTachometerAlt className="me-2" /> Tableau de bord
              </Nav.Link>
            </Link>
            <Link href="/admin/agencies" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2 text-white">
                <FaBuilding className="me-2" /> Agences
              </Nav.Link>
            </Link>
            <Link href="/admin/plans" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2 text-white">
                <FaDollarSign className="me-2" /> Plans
              </Nav.Link>
            </Link>
            <Link href="/admin/subscriptions" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2 text-white">
                <FaUsers className="me-2" /> Abonnements
              </Nav.Link>
            </Link>
            <Link href="/admin/tickets" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2 text-white">
                <FaTicketAlt className="me-2" /> Tickets
              </Nav.Link>
            </Link>
          </Nav>
          <div className="mt-auto">
            <Button variant="outline-light" className="w-100" onClick={() => signOut({ callbackUrl: '/' })}>
              Déconnexion
            </Button>
          </div>
        </Col>
        <Col md={10} className="p-4">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardLayout;
