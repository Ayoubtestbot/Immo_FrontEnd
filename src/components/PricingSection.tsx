import React, { useState } from 'react';
import { FaFeatherAlt, FaCrown, FaRocket, FaGift, FaCheck } from 'react-icons/fa';
import type { Plan } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import styles from '@/styles/ModernPricing.module.css';

type PricingSectionProps = {
  plans: Plan[];
};

const PricingSection = ({ plans }: PricingSectionProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const sortedPlans = [...plans].sort((a, b) => {
    const order = ['Free Trial', 'Starter', 'Pro', 'Entreprise'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  const getDisplayedPrice = (plan: Plan) => {
    if (isYearly) {
      switch (plan.name) {
        case 'Starter':
          return { price: 4990, period: '/an', save: '2 mois offerts' };
        case 'Pro':
          return { price: 7990, period: '/an', save: '2 mois offerts' };
        case 'Entreprise':
          return { price: 19900, period: '/an', save: '2 mois offerts' };
        default:
          return { price: plan.price, period: '/mois', save: '' };
      }
    } else {
      return { price: plan.price, period: '/mois', save: '' };
    }
  };

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
        return <FaGift />;
      case 'starter':
        return <FaFeatherAlt />;
      case 'pro':
        return <FaCrown />;
      case 'entreprise':
        return <FaRocket />;
      default:
        return <FaFeatherAlt />;
    }
  };

  const getPlanGradient = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'starter':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'pro':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'entreprise':
        return 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <section id="pricing" className={styles.section}>
      <div className="modern-container">
        <div className={styles.sectionHeader}>
          <h2 className="modern-section-title">Des tarifs adaptés à chaque agence</h2>
          <p className="modern-section-subtitle">
            Choisissez le plan qui correspond à vos ambitions et développez votre activité
          </p>
        </div>

        <div className={styles.billingToggle}>
          <button
            className={!isYearly ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setIsYearly(false)}
          >
            Mensuel
          </button>
          <button
            className={isYearly ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setIsYearly(true)}
          >
            Annuel
            <span className={styles.saveBadge}>Économisez 15%</span>
          </button>
        </div>

        <div className={styles.pricingGrid}>
          {sortedPlans.map((plan, index) => (
            <div
              className={`${styles.pricingCard} ${plan.name.toLowerCase() === 'pro' ? styles.popularCard : ''}`}
              key={plan.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.name.toLowerCase() === 'pro' && (
                <div className={styles.popularBadge}>
                  <FaCrown size={14} />
                  <span>Le plus populaire</span>
                </div>
              )}

              <div className={styles.cardHeader}>
                <div className={styles.planIcon} style={{ background: getPlanGradient(plan.name) }}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className={styles.planName}>{plan.name}</h3>
              </div>

              <div className={styles.priceContainer}>
                <div className={styles.price}>
                  <span className={styles.currency}>MAD</span>
                  <span className={styles.amount}>{getDisplayedPrice(plan).price}</span>
                  <span className={styles.period}>{getDisplayedPrice(plan).period}</span>
                </div>
                {getDisplayedPrice(plan).save && (
                  <div className={styles.saveLabel}>{getDisplayedPrice(plan).save}</div>
                )}
              </div>

              <ul className={styles.featuresList}>
                {plan.features.split(',').map((feature, fIndex) => (
                  <li key={fIndex} className={styles.featureItem}>
                    <FaCheck className={styles.checkIcon} />
                    <span>{feature.trim()}</span>
                  </li>
                ))}
              </ul>

              <button
                className={plan.name.toLowerCase() === 'pro' ? styles.btnPrimary : styles.btnSecondary}
                onClick={() => handleChoosePlan(plan.id)}
              >
                Choisir ce plan
                <FaRocket size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && showPayPalModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPayPalModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Finaliser votre abonnement</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowPayPalModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.planSummary}>
                <h4>Plan {selectedPlan.name}</h4>
                <div className={styles.summaryPrice}>
                  {getDisplayedPrice(selectedPlan).price} MAD{getDisplayedPrice(selectedPlan).period}
                </div>
              </div>
              <p className={styles.paymentInstructions}>
                Cliquez sur le bouton PayPal ci-dessous pour finaliser votre paiement de manière sécurisée.
              </p>
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
      )}
    </section>
  );
};

export default PricingSection;
