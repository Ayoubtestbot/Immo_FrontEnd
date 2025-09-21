import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaQuoteLeft } from 'react-icons/fa';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: 'LeadEstate a transformé notre manière de travailler. Nous avons augmenté notre taux de conversion de 20% en seulement trois mois !',
      author: 'Claire Dubois',
      company: 'Agence ImmoPlus',
    },
    {
      quote: 'La simplicité d\'utilisation et la puissance des fonctionnalités analytiques sont incroyables. Un outil indispensable.',
      author: 'Marc Petit',
      company: 'Le Bon Agent',
    },
    {
      quote: 'Enfin une plateforme qui comprend les besoins spécifiques des agences immobilières. Le suivi des prospects est parfait.',
      author: 'Julien Leroy',
      company: 'Propriétés & Co.',
    },
  ];

  return (
    <div id="about" className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Ils nous font confiance</h2>
          <p className="lead text-muted">Découvrez pourquoi les meilleures agences choisissent LeadEstate.</p>
        </div>
        <Row>
          {testimonials.map((testimonial, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column p-4">
                  <FaQuoteLeft className="text-primary mb-3" size={30} />
                  <blockquote className="blockquote mb-4 flex-grow-1">
                    <p>{testimonial.quote}</p>
                  </blockquote>
                  <footer className="blockquote-footer mt-auto">
                    <strong>{testimonial.author}</strong>, <cite title="Source Title">{testimonial.company}</cite>
                  </footer>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default TestimonialsSection;
