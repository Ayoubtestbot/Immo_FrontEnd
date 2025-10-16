import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { prisma } from '@/lib/prisma';
import type { Agency, Plan, Subscription, User } from '@prisma/client';
import { Card, Form, Button, Alert, Modal, Col, Row } from 'react-bootstrap';
import { format } from 'date-fns';

type AgencyWithDetails = Agency & {
  subscription: (Subscription & { plan: Plan }) | null;
};

type SettingsPageProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  agency: AgencyWithDetails;
};

import { countries } from 'countries-list';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'MAD'];

const SettingsPage = ({ user, agency }: SettingsPageProps) => {
  // Agency state
  const [agencyName, setAgencyName] = useState(agency.name);
  const [selectedCurrency, setSelectedCurrency] = useState(agency.currency);
  const [selectedCountry, setSelectedCountry] = useState(agency.country || '');

  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // General state
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    value: code,
    label: country.name,
  }));

  const handleAgencySettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agencyName, currency: selectedCurrency, country: selectedCountry }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update settings');
      }
      setMessage('Agency settings updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to change password');
      }
      setMessage('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1>Paramètres</h1>

      {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Profil Utilisateur</Card.Header>
            <Card.Body>
              <p><strong>Nom:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>Changer le mot de passe</Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Paramètres de l&apos;agence</Card.Header>
            <Card.Body>
              <Form onSubmit={handleAgencySettingsUpdate}>
                <Form.Group className="mb-3" controlId="agencyName">
                  <Form.Label>Nom de l&apos;agence</Form.Label>
                  <Form.Control
                    type="text"
                    value={agencyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgencyName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="currencySelect">
                  <Form.Label>Devise</Form.Label>
                  <Form.Select value={selectedCurrency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCurrency(e.target.value)}>
                    {CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="countrySelect">
                  <Form.Label>Pays</Form.Label>
                  <Form.Select value={selectedCountry} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}>
                    <option value="">-- Select Country --</option>
                    {countryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Votre Plan Actuel</Card.Header>
            <Card.Body>
              {agency.subscription && agency.subscription.plan ? (
                <>
                  <p><strong>Plan:</strong> {agency.subscription.plan.name}</p>
                  <p><strong>Limite de prospects:</strong> {agency.subscription.plan.prospectsLimit === -1 ? 'Illimité' : agency.subscription.plan.prospectsLimit}</p>
                  <p><strong>Limite d&apos;utilisateurs:</strong> {agency.subscription.plan.usersLimit === -1 ? 'Illimité' : agency.subscription.plan.usersLimit}</p>
                  <p><strong>Limite de propriétés:</strong> {agency.subscription.plan.propertiesLimit === -1 ? 'Illimité' : agency.subscription.plan.propertiesLimit}</p>
                  {agency.subscription.endDate && <p><strong>Date de fin:</strong> {format(new Date(agency.subscription.endDate), 'dd/MM/yyyy')}</p>}
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
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Changer le mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Mot de passe actuel</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Changer le mot de passe'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const agencyId = session.user.agencyId;
  const userId = session.user.id;

  if (!agencyId || !userId) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

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

  if (!agency || !user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
      agency: JSON.parse(JSON.stringify(agency)),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default SettingsPage;