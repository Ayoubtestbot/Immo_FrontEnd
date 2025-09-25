import React from 'react';
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // Removed signIn
import { FaRocket } from 'react-icons/fa';
// import { useRouter } from 'next/router'; // No longer needed if not using handleQuickRegisterAndLogin

const Header = () => {
  const { data: session, status } = useSession();
  // const router = useRouter(); // No longer needed

  const getDashboardUrl = () => {
    if (!session?.user) return '/login';
    if (session.user.role === 'ADMIN') return '/admin/dashboard';
    if (session.user.agencyId) return '/agency/dashboard';
    return '/'; // Stay on home page if logged in but no agency
  };

  // Removed handleQuickRegisterAndLogin function

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} href="/" className="d-flex align-items-center">
            <FaRocket className="me-2 text-primary" size={24} />
            <span className="fw-bold">LeadEstate</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} href="/#services">Services</Nav.Link>
            <Nav.Link as={Link} href="/#pricing">Tarifs</Nav.Link>
            <Nav.Link as={Link} href="/#features">Fonctionnalités</Nav.Link>
            <Nav.Link as={Link} href="/#about">À propos</Nav.Link>
            <Nav.Link as={Link} href="/#contact">Contact</Nav.Link>
          </Nav>
          {status === 'loading' && <Spinner animation="border" variant="primary" size="sm" />}
          {status === 'unauthenticated' && (
            <>
              <Link href="/register" className="btn btn-outline-primary me-2"> {/* S'enregistrer */}
                S'enregistrer
              </Link>
              <Link href="/login" className="btn btn-primary"> {/* Se connecter */}
                Se connecter
              </Link>
            </>
          )}
          {status === 'authenticated' && (
            <>
              <Link href={getDashboardUrl()} className="btn btn-primary me-2">
                Tableau de bord
              </Link>
              <Button variant="outline-secondary" onClick={() => signOut()}>
                Déconnexion
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
