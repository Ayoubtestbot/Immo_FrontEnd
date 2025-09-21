import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const HeroSection = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="py-lg-5">
        <Col lg={8} md={10} className="mx-auto">
          <h1 className="fw-light">La plateforme tout-en-un pour votre agence immobilière</h1>
          <p className="lead text-muted">
            Gérez vos prospects, vos propriétés, et votre pipeline de vente avec une efficacité redoutable. LeadEstate centralise vos opérations pour transformer vos prospects en clients satisfaits.
          </p>
          <p className="mb-4">
            <Button variant="primary" className="my-2">Commencez votre essai gratuit</Button>{' '}
            <Button variant="secondary" className="my-2">Découvrir les fonctionnalités</Button>
          </p>
          <img
            src="https://source.unsplash.com/random/800x400?saas,business,dashboard" // SaaS-related placeholder image
            alt="LeadEstate Hero Image"
            className="img-fluid rounded shadow-lg mt-4"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HeroSection;
