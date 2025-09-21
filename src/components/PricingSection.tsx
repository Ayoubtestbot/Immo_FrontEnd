import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaFeatherAlt, FaCrown, FaBuilding } from 'react-icons/fa';

const PricingSection = () => {
  const plans = [
    {
      icon: <FaFeatherAlt size={30} className="mb-3" />,
      name: 'Agence Starter',
      price: '49€',
      features: [
        'Gestion de 50 prospects',
        'Accès aux fonctionnalités de base',
        'Support par email',
      ],
      isFeatured: false,
    },
    {
      icon: <FaCrown size={30} className="mb-3 text-white" />,
      name: 'Agence Pro',
      price: '99€',
      features: [
        'Gestion illimitée de prospects',
        'Rapports avancés',
        'Intégration CRM',
        'Support prioritaire',
      ],
      isFeatured: true,
    },
    {
      icon: <FaBuilding size={30} className="mb-3" />,
      name: 'Agence Entreprise',
      price: 'Sur devis',
      features: [
        'Accès complet à toutes les fonctionnalités',
        'Support dédié 24/7',
        'Personnalisation et intégration sur mesure',
        'Formation de l\'équipe',
      ],
      isFeatured: false,
    },
  ];

  return (
    <div id="pricing" className="bg-light py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Des tarifs adaptés à chaque agence</h2>
          <p className="lead text-muted">Choisissez le plan qui correspond à vos ambitions.</p>
        </div>
        <Row className="justify-content-center align-items-center">
          {plans.map((plan, index) => (
            <Col lg={4} md={6} className="mb-4" key={index}>
              <Card className={`h-100 text-center ${plan.isFeatured ? 'bg-primary text-white' : ''}`}>
                <Card.Body className="d-flex flex-column p-4">
                  {plan.icon}
                  <h4 className="my-0 fw-normal">{plan.name}</h4>
                  <hr className={plan.isFeatured ? 'text-white-50' : ''} />
                  <h1 className="card-title pricing-card-title">
                    {plan.price}<small className={plan.isFeatured ? 'text-white-50' : 'text-muted'}>/mois</small>
                  </h1>
                  <ul className="list-unstyled mt-3 mb-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="mb-2">{feature}</li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.isFeatured ? 'light' : 'primary'} 
                    className="w-100 mt-auto"
                  >
                    Choisir ce plan
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default PricingSection;
