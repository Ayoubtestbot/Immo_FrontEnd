import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Subscription, Agency, Plan } from '@prisma/client';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';

type SubscriptionWithDetails = Subscription & {
  agency: Agency;
  plan: Plan;
};

type AdminSubscriptionsPageProps = {
  subscriptions: SubscriptionWithDetails[];
  plans: Plan[];
};

const AdminSubscriptionsPage = ({ subscriptions, plans }: AdminSubscriptionsPageProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionWithDetails | null>(null);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setShowEditModal(false);
    setCurrentSubscription(null);
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSelectedPlanId('');
    setError('');
    setLoading(false);
  };

  const handleShowEditModal = (subscription: SubscriptionWithDetails) => {
    setCurrentSubscription(subscription);
    setStatus(subscription.status);
    setStartDate(new Date(subscription.startDate).toISOString().split('T')[0]);
    setEndDate(subscription.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : '');
    setSelectedPlanId(subscription.planId);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    router.replace(router.asPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentSubscription) return;

    try {
      const res = await fetch(`/api/admin/subscriptions/${currentSubscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          startDate,
          endDate,
          planId: selectedPlanId,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update subscription');
      }

      handleClose();
      handleRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cet abonnement ?')) return;

    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete subscription');
      }

      handleRefresh();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="header">
        <h1>Gestion des Abonnements</h1>
      </div>

      <div className="table-responsive-wrapper">
        <input
          type="text"
          placeholder="Rechercher par agence ou plan..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        {filteredSubscriptions.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Agence</th>
              <th>Plan</th>
              <th>Statut</th>
              <th>Début</th>
              <th>Fin</th>
              <th className="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub, index) => (
              <tr key={sub.id}>
                <td>{index + 1}</td>
                <td>{sub.agency.name}</td>
                <td>{sub.plan.name}</td>
                <td>{sub.status}</td>
                <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</td>
                <td className="action-cell">
                  <button className="secondary-action-button me-2" onClick={() => handleShowEditModal(sub)}>Modifier</button>
                  <button className="secondary-action-button" onClick={() => handleDelete(sub.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">Aucun abonnement trouvé.</div>
      )}
      </div>

      {/* Edit Subscription Modal */}
      <Modal show={showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l&apos;Abonnement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Control type="text" value={status} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatus(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de Début</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de Fin (optionnel)</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plan d&apos;Abonnement</Form.Label>
              <Form.Select value={selectedPlanId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlanId(e.target.value)} required>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} className="me-2">Annuler</Button>
              <Button type="submit" disabled={loading} variant="primary">
                {loading ? 'Enregistrement...' : 'Mettre à jour'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </AdminDashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user?.role !== UserRole.ADMIN) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const subscriptions = await prisma.subscription.findMany({
    include: {
      agency: true,
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const plans = await prisma.plan.findMany({
    orderBy: { name: 'asc' },
  });

  return {
    props: {
      subscriptions: JSON.parse(JSON.stringify(subscriptions)),
      plans: JSON.parse(JSON.stringify(plans)),
    },
  };
};

export default AdminSubscriptionsPage;
