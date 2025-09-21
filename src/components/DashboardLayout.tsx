import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaBuilding, FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="bg-light vh-100 p-3 d-flex flex-column">
          <h4 className="mb-4">LeadEstate</h4>
          <Nav className="flex-column">
            <Link href="/agency/dashboard" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2">
                <FaTachometerAlt className="me-2" /> Tableau de bord
              </Nav.Link>
            </Link>
            <Link href="/agency/leads" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2">
                <FaUsers className="me-2" /> Prospects
              </Nav.Link>
            </Link>
            <Link href="/agency/properties" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2">
                <FaBuilding className="me-2" /> Propriétés
              </Nav.Link>
            </Link>
            <Link href="/agency/tickets" passHref legacyBehavior>
              <Nav.Link className="d-flex align-items-center mb-2">
                <FaTicketAlt className="me-2" /> Tickets
              </Nav.Link>
            </Link>
          </Nav>
          <div className="mt-auto">
            {/* User profile / logout button can go here */}
          </div>
        </Col>
        <Col md={10} className="p-4">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;
