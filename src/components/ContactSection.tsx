import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const ContactSection = () => {
  return (
    <div id="contact" className="bg-light py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Prêt à commencer ?</h2>
          <p className="lead text-muted">Inscrivez-vous pour un essai gratuit ou contactez-nous pour en savoir plus.</p>
        </div>
        <Row className="justify-content-center">
          <Col lg={7} md={9}>
            <Card className="p-4">
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Votre nom</Form.Label>
                        <Form.Control type="text" placeholder="Entrez votre nom" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Adresse email</Form.Label>
                        <Form.Control type="email" placeholder="Entrez votre email" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="formBasicMessage">
                    <Form.Label>Votre message (optionnel)</Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="Comment pouvons-nous vous aider ?" />
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="primary" type="submit" size="lg">
                      Commencer mon essai gratuit
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactSection;
