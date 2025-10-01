import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { prisma } from '@/lib/prisma';
import type { Agency, Plan, Subscription } from '@prisma/client';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

type AgencyWithDetails = Agency & {
  subscription: (Subscription & { plan: Plan & { usersLimit: number } }) | null;
};

type SettingsPageProps = {
  agency: AgencyWithDetails;
  availablePlans: Plan[];
};

const CURRENCIES = ['EUR', 'USD', 'GBP', 'MAD']; // Added MAD

const SettingsPage = ({ agency, availablePlans }: SettingsPageProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(agency.currency);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log('Agency currency (from component state):', agency.currency); // Keep debug log

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update currency');
      }
      setMessage('Devise mise à jour avec succès !');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1>Paramètres de l&apos;agence</h1>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>Votre Plan Actuel</Card.Header>
        <Card.Body>
          {agency.subscription && agency.subscription.plan ? (
            <>
              <p><strong>Plan:</strong> {agency.subscription.plan.name}</p>
              <p><strong>Prix:</strong> {agency.subscription.plan.price.toLocaleString('fr-FR', { style: 'currency', currency: agency.currency || 'EUR' })} / mois</p>
              <p><strong>Limite de prospects:</strong> {agency.subscription.plan.prospectsLimit}</p>
              <p><strong>Limite d&apos;utilisateurs:</strong> {agency.subscription.plan.usersLimit}</p> {/* New line */}
              <p><strong>Date de fin:</strong> {agency.subscription.endDate ? format(new Date(agency.subscription.endDate), 'dd/MM/yyyy') : 'N/A'}</p>
              <Button className="btn-primary">Mettre à niveau le plan</Button>
            </>
          ) : (
            <>
              <p>Vous n&apos;avez pas de plan actif.</p>
              <Button className="btn-primary">Choisir un plan</Button>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Choix de la Devise</Card.Header>
        <Card.Body>
          <Form.Group controlId="currencySelect">
            <Form.Label>Sélectionner votre devise préférée</Form.Label>
            <Form.Select value={selectedCurrency} onChange={handleCurrencyChange} disabled={loading}>
              {CURRENCIES.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Other parameters section can be added here */}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const agencyId = session.user.agencyId;

  if (!agencyId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  const availablePlans = await prisma.plan.findMany();

  if (!agency) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      agency: JSON.parse(JSON.stringify(agency)),
      availablePlans: JSON.parse(JSON.stringify(availablePlans)),
    },
  };
}, ['AGENCY_OWNER']); // Only AGENCY_OWNER can manage settings

export default SettingsPage;
