import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { FaFeatherAlt, FaCrown, FaBuilding, FaGift, FaRocket } from 'react-icons/fa'; // Added FaGift, FaRocket
import type { Plan } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { PayPalButtons } from '@paypal/react-paypal-js'; // Assuming this is imported from somewhere

type PricingSectionProps = {
  plans: Plan[];
};

const PricingSection = ({ plans }: PricingSectionProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const freeTrialPlan = plans.find(p => p.name === 'Free Trial');
  const mainPlans = plans.filter(p => p.name !== 'Free Trial');

  const getDisplayedPrice = (plan: Plan) => {
    if (isYearly) {
      switch (plan.name) {
        case 'Starter':
          return { price: 4990, period: '/an' };
        case 'Pro':
          return { price: 7990, period: '/an' };
        case 'Entreprise':
          return { price: 19900, period: '/an' };
        default:
          return { price: plan.price, period: '/mois' }; // Fallback to monthly if yearly not defined
      }
    } else {
      return { price: plan.price, period: '/mois' };
    }
  };

  // Manually sort mainPlans
  mainPlans.sort((a, b) => {
    const order = ['Starter', 'Pro', 'Entreprise'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  const handleChoosePlan = (planId: string) => {
    if (!session) {
      router.push('/register'); // Redirect to register if not logged in
    } else {
      // TODO: Implement payment process for logged-in users
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setShowPayPalModal(true);
      }
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return <FaGift size={30} className="mb-3" />;
      case 'starter':
        return <FaFeatherAlt size={30} className="mb-3" />;
      case 'pro':
        return <FaCrown size={30} className="mb-3 text-white" />;
      case 'entreprise': // Changed from 'business' to 'entreprise'
        return <FaRocket size={30} className="mb-3" />;
      default:
        return <FaFeatherAlt size={30} className="mb-3" />;
    }
  };

  return (
    <div id="pricing" className="bg-light py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-light">Des tarifs adaptés à chaque agence</h2>
          <p className="lead text-muted">Choisissez le plan qui correspond à vos ambitions.</p>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group" role="group">
            <Button
              variant={!isYearly ? 'primary' : 'outline-primary'}
              onClick={() => setIsYearly(false)}
            >
              Mensuel
            </Button>
            <Button
              variant={isYearly ? 'primary' : 'outline-primary'}
              onClick={() => setIsYearly(true)}
            >
              Annuel
            </Button>
          </div>
        </div>

        {/* Free Trial Plan (Horizontal) */}
        {freeTrialPlan && (
          <Row className="justify-content-center mb-5">
            <Col md={6}>
              <Card className="text-center free-trial-card"> {/* Added free-trial-card class */}
                <Card.Body className="d-flex flex-column p-4">
                  {getPlanIcon(freeTrialPlan.name)}
                  <h4 className="my-0 fw-normal">{freeTrialPlan.name}</h4>
                  <hr />
                  <h1 className="card-title pricing-card-title">
                    {getDisplayedPrice(freeTrialPlan).price} MAD<small className="text-muted">{getDisplayedPrice(freeTrialPlan).period}</small>
                  </h1>
                  <ul className="list-unstyled mt-3 mb-4">
                    {freeTrialPlan.features.split(',').map((feature, fIndex) => (
                      <li key={fIndex} className="mb-2">{feature.trim()}</li>
                    ))}
                  </ul>
                  <Button
                    variant="primary"
                    className="w-100 mt-auto"
                    onClick={() => handleChoosePlan(freeTrialPlan.id)}
                  >
                    Choisir ce plan
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Plans (Starter, Pro, Entreprise) */}
        <Row className="justify-content-center align-items-center">
          {mainPlans.map((plan) => (
            <Col lg={4} md={6} className="mb-4" key={plan.id}>
              <Card className={`h-100 text-center ${plan.name.toLowerCase() === 'pro' ? 'bg-primary text-white' : ''}`}>
                <Card.Body className="d-flex flex-column p-4">
                  {getPlanIcon(plan.name)}
                  <h4 className="my-0 fw-normal">{plan.name}</h4>
                  <hr className={plan.name.toLowerCase() === 'pro' ? 'text-white-50' : ''} />
                  <h1 className="card-title pricing-card-title">
                    {getDisplayedPrice(plan).price} MAD<small className={plan.name.toLowerCase() === 'pro' ? 'text-white-50' : 'text-muted'}>{getDisplayedPrice(plan).period}</small>
                  </h1>
                  <ul className="list-unstyled mt-3 mb-4">
                    {plan.features.split(',').map((feature, fIndex) => (
                      <li key={fIndex} className="mb-2">{feature.trim()}</li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.name.toLowerCase() === 'pro' ? 'light' : 'primary'}
                    className="w-100 mt-auto"
                    onClick={() => handleChoosePlan(plan.id)}
                  >
                    Choisir ce plan
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* PayPal Payment Modal */}
      <Modal show={showPayPalModal} onHide={() => setShowPayPalModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payer l'abonnement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <div className="text-center">
              <h4>Vous êtes sur le point de vous abonner au plan {selectedPlan.name} pour {getDisplayedPrice(selectedPlan).price} MAD</h4>
              <p>Cliquez sur le bouton PayPal ci-dessous pour finaliser votre paiement.</p>
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={async (data, actions) => {
                  const res = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: selectedPlan.price }),
                  });
                  const order = await res.json();
                  return order.id;
                }}
                onApprove={async (data, actions) => {
                  const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderID: data.orderID }),
                  });
                  const capture = await res.json();
                  console.log('Capture result:', capture);
                  alert('Paiement réussi !');
                  setShowPayPalModal(false);
                  // TODO: Update user's subscription in the database
                }}
                onCancel={() => alert('Paiement annulé.')}
                onError={(err) => {
                  console.error('PayPal Error:', err);
                  alert('Une erreur est survenue lors du paiement PayPal.');
                }}
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PricingSection;
