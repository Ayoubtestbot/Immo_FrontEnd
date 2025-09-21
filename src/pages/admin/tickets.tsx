import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Ticket, Agency, User } from '@prisma/client';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';

type TicketWithDetails = Ticket & {
  agency: Agency;
  user: User;
};

type AdminTicketsPageProps = {
  tickets: TicketWithDetails[];
};

const AdminTicketsPage = ({ tickets }: AdminTicketsPageProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketWithDetails | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setShowEditModal(false);
    setCurrentTicket(null);
    setSubject('');
    setDescription('');
    setStatus('');
    setPriority('');
    setError('');
    setLoading(false);
  };

  const handleShowEditModal = (ticket: TicketWithDetails) => {
    setCurrentTicket(ticket);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    router.replace(router.asPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentTicket) return;

    try {
      const res = await fetch(`/api/admin/tickets/${currentTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          status,
          priority,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update ticket');
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;

    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete ticket');
      }

      handleRefresh();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Tickets</h1>
      </div>

      {tickets.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Sujet</th>
              <th>Agence</th>
              <th>Utilisateur</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={ticket.id}>
                <td>{index + 1}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.agency.name}</td>
                <td>{ticket.user.name || ticket.user.email}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(ticket)}>Modifier</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(ticket.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Aucun ticket trouvé.</Alert>
      )}

      {/* Edit Ticket Modal */}
      <Modal show={showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Sujet</Form.Label>
              <Form.Control type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} required>
                {Object.values(TicketStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priorité</Form.Label>
              <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                {Object.values(TicketPriority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleClose} className="me-2">Annuler</Button>
              <Button variant="primary" type="submit" disabled={loading}>
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

  const tickets = await prisma.ticket.findMany({
    include: {
      agency: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      session,
      tickets: JSON.parse(JSON.stringify(tickets)),
    },
  };
};

export default AdminTicketsPage;
