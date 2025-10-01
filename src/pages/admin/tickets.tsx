import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Ticket, Agency, User } from '@prisma/client';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';
import TicketMessages from '@/components/TicketMessages';
import { ticketStatusTranslations } from '@/utils/ticketStatusTranslations';
import { ticketPriorityTranslations } from '@/utils/ticketPriorityTranslations';

type TicketWithDetails = Ticket & {
  agency: Agency;
  user: User;
};

type AdminTicketsPageProps = {
  tickets: TicketWithDetails[];
  ticketStatuses: string[];
  ticketPriorities: string[];
};

const AdminTicketsPage = ({ tickets, ticketStatuses, ticketPriorities }: AdminTicketsPageProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<TicketWithDetails | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setShowEditModal(false);
    setShowViewModal(false);
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

  const handleShowViewModal = (ticket: TicketWithDetails) => {
    setCurrentTicket(ticket);
    setShowViewModal(true);
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
      <div className="header">
        <h1>Gestion des Tickets</h1>
      </div>

      <div className="table-responsive-wrapper">
        <input
          type="text"
          placeholder="Rechercher par sujet, agence ou utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        {filteredTickets.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Sujet</th>
              <th>Agence</th>
              <th>Utilisateur</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th className="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr key={ticket.id}>
                <td>{index + 1}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.agency.name}</td>
                <td>{ticket.user.name || ticket.user.email}</td>
                <td>{ticketStatusTranslations[ticket.status]}</td>
                <td>{ticketPriorityTranslations[ticket.priority]}</td>
                <td className="action-cell">
                  <button className="secondary-action-button me-2" onClick={() => handleShowViewModal(ticket)}>Voir</button>
                  <button className="secondary-action-button me-2" onClick={() => handleShowEditModal(ticket)}>Modifier</button>
                  <button className="secondary-action-button" onClick={() => handleDelete(ticket.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">Aucun ticket trouvé.</div>
      )}
      </div>

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
                {ticketStatuses.map((s) => (
                  <option key={s} value={s}>{ticketStatusTranslations[s]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priorité</Form.Label>
              <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)} required>
                {ticketPriorities.map((p) => (
                  <option key={p} value={p}>{ticketPriorityTranslations[p]}</option>
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

      {/* View Ticket Modal */}
      <Modal show={showViewModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTicket && (
            <div>
              <h5>{currentTicket.subject}</h5>
              <p><strong>Agence:</strong> {currentTicket.agency.name}</p>
              <p><strong>Utilisateur:</strong> {currentTicket.user.name || currentTicket.user.email}</p>
              <p><strong>Status:</strong> {ticketStatusTranslations[currentTicket.status]}</p>
              <p><strong>Priorité:</strong> {ticketPriorityTranslations[currentTicket.priority]}</p>
              <hr />
              <h6>Discussion</h6>
              {currentTicket && <TicketMessages ticketId={currentTicket.id} />}
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

  const tickets = await prisma.ticket.findMany({
    include: {
      agency: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      tickets: JSON.parse(JSON.stringify(tickets)),
      ticketStatuses: Object.values(TicketStatus),
      ticketPriorities: Object.values(TicketPriority),
    },
  };
};

export default AdminTicketsPage;
