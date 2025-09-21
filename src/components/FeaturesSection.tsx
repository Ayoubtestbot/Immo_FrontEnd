import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaFileImport, FaStream, FaCreditCard, FaChartLine, FaHome, FaUserLock } from 'react-icons/fa';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaFileImport size={30} className="text-primary mb-3" />,
      title: 'Ajout de prospects simplifié',
      description: 'Importez des listes depuis CSV/Google Sheets, ou ajoutez des prospects manuellement en quelques clics.',
    },
    {
      icon: <FaStream size={30} className="text-primary mb-3" />,
      title: 'Pipeline de vente visuel',
      description: 'Gérez votre pipeline avec une vue Kanban claire qui montre les prospects à chaque étape du processus de vente.',
    },
    {
      icon: <FaCreditCard size={30} className="text-primary mb-3" />,
      title: 'Gestion des abonnements intégrée',
      description: 'Les agences peuvent gérer leurs abonnements, utilisateurs, et permissions directement depuis leur tableau de bord.',
    },
    {
      icon: <FaChartLine size={30} className="text-primary mb-3" />,
      title: 'Tableau de bord analytique',
      description: 'Prenez des décisions basées sur les données avec des statistiques détaillées sur vos taux de conversion et performances.',
    },
    {
      icon: <FaHome size={30} className="text-primary mb-3" />,
      title: 'Gestion des propriétés',
      description: 'Liez un prospect à des propriétés spécifiques, suivez les interactions et l\'historique des visites.',
    },
    {
      icon: <FaUserLock size={30} className="text-primary mb-3" />,
      title: 'Gestion des utilisateurs et permissions',
      description: 'Contrôlez qui a accès à quoi avec un système de permissions granulaires par utilisateur au sein de chaque agence.',
    }
  ];

  return (
    <div id="features" className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Des fonctionnalités pensées pour vous</h2>
          <p className="lead text-muted">Des outils puissants pour une gestion sans effort.</p>
        </div>
        <Row>
          {features.map((feature, index) => (
            <Col md={6} lg={4} className="mb-4" key={index}>
              <Card className="h-100 p-3">
                <Card.Body>
                  {feature.icon}
                  <Card.Title as="h5">{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default FeaturesSection;
