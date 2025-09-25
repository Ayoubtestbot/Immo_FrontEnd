import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useRouter } from 'next/router'; // New import

const HeroSection = () => {
  const router = useRouter(); // Initialize useRouter

  const handleStartTrial = () => {
    router.push('/register'); // Redirect to /register
  };

  return (
    <Container className="py-5 text-center">
      <Row className="py-lg-5">
        <Col lg={8} md={10} className="mx-auto">
          <h1 className="fw-light">La plateforme tout-en-un pour votre agence immobilière</h1>
          <p className="lead text-muted">
            Gérez vos prospects, vos propriétés, et votre pipeline de vente avec une efficacité redoutable. LeadEstate centralise vos opérations pour transformer vos prospects en clients satisfaits.
          </p>
          <p className="mb-4">
            <Button variant="primary" className="my-2" onClick={handleStartTrial}>Commencez votre essai gratuit</Button>{' '}
            <Button variant="secondary" className="my-2">Découvrir les fonctionnalités</Button>
          </p>
          <img
            src="https://placehold.co/800x400/1abc9c/ffffff?text=LeadEstate" // Stable placeholder image
            alt="LeadEstate Hero Image"
            className="img-fluid rounded shadow-lg mt-4"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HeroSection;