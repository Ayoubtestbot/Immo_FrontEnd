import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="py-5 bg-dark text-white">
      <Container>
        <Row>
          <Col md={4}>
            <h5>LeadEstate</h5>
            <p className="text-muted">La plateforme tout-en-un pour les agences immobilières.</p>
          </Col>
          <Col md={2}>
            <h6>Navigation</h6>
            <Nav className="flex-column">
              <Nav.Link href="#services" className="text-white-50">Services</Nav.Link>
              <Nav.Link href="#pricing" className="text-white-50">Tarifs</Nav.Link>
              <Nav.Link href="#features" className="text-white-50">Fonctionnalités</Nav.Link>
            </Nav>
          </Col>
          <Col md={2}>
            <h6>Légal</h6>
            <Nav className="flex-column">
              <Nav.Link href="#" className="text-white-50">Mentions légales</Nav.Link>
              <Nav.Link href="#" className="text-white-50">Politique de confidentialité</Nav.Link>
            </Nav>
          </Col>
          <Col md={4}>
            <h6>Contact</h6>
            <p className="text-muted">
              Email: contact@leadestate.com <br />
              Téléphone: +33 1 23 45 67 89
            </p>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} LeadEstate. Tous droits réservés.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
