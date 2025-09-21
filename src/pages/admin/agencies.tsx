import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Agency, Plan, Subscription } from '@prisma/client';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';

type AgencyWithDetails = Agency & {
  users: { id: string; name: string; email: string; role: UserRole }[];
  subscription: (Subscription & { plan: Plan }) | null;
};

type AdminAgenciesPageProps = {
  agencies: AgencyWithDetails[];
  plans: Plan[];
};

const AdminAgenciesPage = ({ agencies, plans }: AdminAgenciesPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAgency, setCurrentAgency] = useState<AgencyWithDetails | null>(null);
  const [name, setName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentAgency(null);
    setName('');
    setSelectedPlanId('');
    setError('');
    setLoading(false);
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleShowEditModal = (agency: AgencyWithDetails) => {
    setCurrentAgency(agency);
    setName(agency.name);
    setSelectedPlanId(agency.subscription?.planId || '');
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    router.replace(router.asPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const method = currentAgency ? 'PUT' : 'POST';
    const url = currentAgency ? `/api/admin/agencies/${currentAgency.id}` : '/api/admin/agencies';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Failed to ${currentAgency ? 'update' : 'create'} agency`);
      }

      // Handle subscription assignment/update if a plan is selected
      if (selectedPlanId) {
        const agencyId = currentAgency ? currentAgency.id : (await res.json()).id; // Get new agency ID if created
        const subscriptionUrl = currentAgency?.subscription?.id 
          ? `/api/admin/subscriptions/${currentAgency.subscription.id}` 
          : '/api/admin/subscriptions';
        const subscriptionMethod = currentAgency?.subscription?.id ? 'PUT' : 'POST';

        const subRes = await fetch(subscriptionUrl, {
          method: subscriptionMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agencyId,
            planId: selectedPlanId,
            status: 'active', // Default status
            startDate: new Date().toISOString(),
          }),
        });

        if (!subRes.ok) {
          const subBody = await subRes.json();
          throw new Error(subBody.error || `Failed to ${currentAgency?.subscription?.id ? 'update' : 'create'} subscription`);
        }
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) return;

    try {
      const res = await fetch(`/api/admin/agencies/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete agency');
      }

      handleRefresh();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Agences</h1>
        <Button variant="primary" onClick={handleShowAddModal}>Ajouter une Agence</Button>
      </div>

      {agencies.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Utilisateurs</th>
              <th>Abonnement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency, index) => (
              <tr key={agency.id}>
                <td>{index + 1}</td>
                <td>{agency.name}</td>
                <td>{agency.users.length}</td>
                <td>{agency.subscription ? agency.subscription.plan.name : 'Aucun'}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(agency)}>Modifier</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(agency.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Aucune agence trouvée. Ajoutez-en une pour commencer !</Alert>
      )}

      {/* Add/Edit Agency Modal */}
      <Modal show={showAddModal || showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentAgency ? 'Modifier l'Agence' : 'Ajouter une Nouvelle Agence'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'Agence</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plan d'Abonnement</Form.Label>
              <Form.Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                <option value="">Sélectionner un plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} className="me-2">Annuler</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : currentAgency ? 'Mettre à jour' : 'Ajouter'}
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

  const agencies = await prisma.agency.findMany({
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true }
      },
      subscription: {
        include: { plan: true }
      }
    },
    orderBy: { name: 'asc' },
  });

  const plans = await prisma.plan.findMany({
    orderBy: { name: 'asc' },
  });

  return {
    props: {
      session,
      agencies: JSON.parse(JSON.stringify(agencies)),
      plans: JSON.parse(JSON.stringify(plans)),
    },
  };
};

export default AdminAgenciesPage;
