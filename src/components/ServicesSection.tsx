import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaBuilding, FaTachometerAlt, FaUserShield } from 'react-icons/fa';

const ServicesSection = () => {
  const services = [
    {
      icon: <FaUsers size={40} className="text-primary mb-3" />,
      title: 'Gestion des prospects',
      description: 'Suivez vos prospects à chaque étape, de la prise de contact à la conversion, avec un suivi détaillé des statuts et des interactions.',
    },
    {
      icon: <FaBuilding size={40} className="text-primary mb-3" />,
      title: 'Gestion des propriétés',
      description: 'Liez facilement des prospects à des biens immobiliers spécifiques et suivez toutes les interactions et l\'intérêt pour chaque propriété.',
    },
    {
      icon: <FaTachometerAlt size={40} className="text-primary mb-3" />,
      title: 'Tableau de bord pour agences',
      description: 'Une vue d\'ensemble claire de la performance de votre agence, de vos agents et de votre portefeuille de propriétés.',
    },
    {
      icon: <FaUserShield size={40} className="text-primary mb-3" />,
      title: 'Backoffice administrateur',
      description: 'Gérez les abonnements, les agences, et les performances globales de la plateforme depuis un backoffice centralisé.',
    },
  ];

  return (
    <div id="services" className="bg-light py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Nos Services</h2>
          <p className="lead text-muted">Tout ce dont vous avez besoin pour faire grandir votre agence.</p>
        </div>
        <Row>
          {services.map((service, index) => (
            <Col md={6} lg={3} className="mb-4" key={index}>
              <Card className="h-100 text-center p-4">
                <Card.Body>
                  {service.icon}
                  <Card.Title as="h5" className="mb-3">{service.title}</Card.Title>
                  <Card.Text className="text-muted">{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default ServicesSection;
