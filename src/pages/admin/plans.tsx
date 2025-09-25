import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Plan } from '@prisma/client';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type PlansPageProps = {
  plans: Plan[];
};

const AdminPlansPage = ({ plans }: PlansPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prospectsLimit, setProspectsLimit] = useState('');
  const [features, setFeatures] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentPlan(null);
    setName('');
    setPrice('');
    setProspectsLimit('');
    setFeatures('');
    setError('');
    setLoading(false);
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleShowEditModal = (plan: Plan) => {
    setCurrentPlan(plan);
    setName(plan.name);
    setPrice(plan.price.toString());
    setProspectsLimit(plan.prospectsLimit.toString());
    setFeatures(plan.features);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    router.replace(router.asPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const method = currentPlan ? 'PUT' : 'POST';
    const url = currentPlan ? `/api/admin/plans/${currentPlan.id}` : '/api/admin/plans';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, prospectsLimit, features }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Failed to ${currentPlan ? 'update' : 'create'} plan`);
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;

    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete plan');
      }

      handleRefresh();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Plans</h1>
        <Button variant="primary" onClick={handleShowAddModal}>Ajouter un Plan</Button>
      </div>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Rechercher un plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {filteredPlans.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Prix</th>
              <th>Limite Prospects</th>
              <th>Fonctionnalités</th>
              <th>Actions</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan, index) => (
              <tr key={plan.id}>
                <td>{index + 1}</td>
                <td>{plan.name}</td>
                <td>{plan.price} MAD</td>
                <td>{plan.prospectsLimit === -1 ? 'Illimité' : plan.prospectsLimit}</td>
                <td>{plan.features}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(plan)}>Modifier</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(plan.id)}>Supprimer</Button>
                </td>
                <td>
                  <Button variant="success" size="sm" onClick={() => {
                    setSelectedPlan(plan);
                    setShowPayPalModal(true);
                  }}>S'abonner</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Aucun plan trouvé. Ajoutez-en un pour commencer !</Alert>
      )}

      {/* Add/Edit Plan Modal */}
      <Modal show={showAddModal || showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentPlan ? 'Modifier le Plan' : 'Ajouter un Nouveau Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom du Plan</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix (MAD)</Form.Label>
              <Form.Control type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Limite Prospects (-1 pour illimité)</Form.Label>
              <Form.Control type="number" value={prospectsLimit} onChange={(e) => setProspectsLimit(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fonctionnalités (séparées par des virgules)</Form.Label>
              <Form.Control as="textarea" rows={3} value={features} onChange={(e) => setFeatures(e.target.value)} required />
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} className="me-2">Annuler</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : currentPlan ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* PayPal Payment Modal */}
      <Modal show={showPayPalModal} onHide={() => setShowPayPalModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payer l'abonnement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <div className="text-center">
              <h4>Vous êtes sur le point de vous abonner au plan {selectedPlan.name} pour {selectedPlan.price} MAD</h4>
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
                  handleRefresh();
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

  const plans = await prisma.plan.findMany({
    orderBy: { name: 'asc' },
  });

  return {
    props: {
      plans: JSON.parse(JSON.stringify(plans)),
    },
  };
};

export default AdminPlansPage;
