import React, { useState } from 'react';
import { FaFeatherAlt, FaCrown, FaBuilding, FaGift, FaRocket } from 'react-icons/fa';
import type { Plan } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import styles from '@/styles/Landing.module.css';

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
          return { price: plan.price, period: '/mois' };
      }
    } else {
      return { price: plan.price, period: '/mois' };
    }
  };

  mainPlans.sort((a, b) => {
    const order = ['Starter', 'Pro', 'Entreprise'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  const handleChoosePlan = (planId: string) => {
    if (!session) {
      router.push('/register');
    } else {
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
        return <FaCrown size={30} className="mb-3" />;
      case 'entreprise':
        return <FaRocket size={30} className="mb-3" />;
      default:
        return <FaFeatherAlt size={30} className="mb-3" />;
    }
  };

  return (
    <section id="pricing" className={styles.section}>
      <h2 className={styles.sectionTitle}>Des tarifs adaptés à chaque agence</h2>
      <p className="lead text-muted">Choisissez le plan qui correspond à vos ambitions.</p>

      <div className="d-flex justify-content-center mb-4">
          <button
            className={!isYearly ? 'btn-primary me-2' : 'btn-outline-primary me-2'}
            onClick={() => setIsYearly(false)}
          >
            Mensuel
          </button>
          <button
            className={isYearly ? 'btn-primary' : 'btn-outline-primary'}
            onClick={() => setIsYearly(true)}
          >
            Annuel
          </button>
      </div>

      <div className="d-flex flex-wrap justify-content-center">
        {freeTrialPlan && (
            <div className="p-4 m-2 card" style={{ flex: '1 1 300px', maxWidth: '350px' }}>
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
                <button
                    className="btn-primary w-100 mt-auto"
                    onClick={() => handleChoosePlan(freeTrialPlan.id)}
                >
                    Choisir ce plan
                </button>
            </div>
        )}

        {mainPlans.map((plan) => (
            <div className={`p-4 m-2 card ${plan.name.toLowerCase() === 'pro' ? 'card-pro' : ''}`} style={{ flex: '1 1 300px', maxWidth: '350px' }} key={plan.id}>
                {plan.name.toLowerCase() === 'pro' && <span className={styles.mostPopularBadge}>Most Popular</span>}
                {getPlanIcon(plan.name)}
                <h4 className="my-0 fw-normal">{plan.name}</h4>
                <hr />
                <h1 className="card-title pricing-card-title">
                    {getDisplayedPrice(plan).price} MAD<small>{getDisplayedPrice(plan).period}</small>
                </h1>
                <ul className="list-unstyled mt-3 mb-4">
                    {plan.features.split(',').map((feature, fIndex) => (
                    <li key={fIndex} className="mb-2">{feature.trim()}</li>
                    ))}
                </ul>
                <button
                    className="btn-primary w-100 mt-auto"
                    onClick={() => handleChoosePlan(plan.id)}
                >
                    Choisir ce plan
                </button>
            </div>
        ))}
        </div>

      {/* PayPal Payment Modal */}
        {selectedPlan && showPayPalModal && (
            <div className="modal d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Payer l&apos;abonnement</h5>
                            <button type="button" className="close" onClick={() => setShowPayPalModal(false)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
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
                                    }}
                                    onCancel={() => alert('Paiement annulé.')}
                                    onError={(err) => {
                                    console.error('PayPal Error:', err);
                                    alert('Une erreur est survenue lors du paiement PayPal.');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </section>
  );
};

export default PricingSection;
