import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Link from 'next/link';
import { FaRocket } from 'react-icons/fa'; // Example icon for logo

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand className="d-flex align-items-center">
            <FaRocket className="me-2 text-primary" size={24} />
            <span className="fw-bold">LeadEstate</span>
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto"> {/* Center navigation links */}
            <Nav.Link as={Link} href="#services">Services</Nav.Link>
            <Nav.Link as={Link} href="#pricing">Tarifs</Nav.Link>
            <Nav.Link as={Link} href="#features">Fonctionnalités</Nav.Link>
            <Nav.Link as={Link} href="#about">À propos</Nav.Link>
            <Nav.Link as={Link} href="#contact">Contact</Nav.Link>
          </Nav>
          <Link href="/login" passHref legacyBehavior>
            <Button variant="primary">Commencez maintenant</Button>
          </Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
