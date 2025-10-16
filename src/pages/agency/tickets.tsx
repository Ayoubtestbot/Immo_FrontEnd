import type { GetServerSideProps } from 'next';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { prisma } from '@/lib/prisma';
import type { Ticket } from '@prisma/client';
import { TicketPriority, TicketCategory } from '@prisma/client';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/router';
import TicketMessages from '@/components/TicketMessages';
import { ticketStatusTranslations } from '@/utils/ticketStatusTranslations';
import { ticketPriorityTranslations } from '@/utils/ticketPriorityTranslations';
import { ticketCategoryTranslations } from '@/utils/ticketCategoryTranslations';

type TicketsPageProps = {
  tickets: Ticket[];
  ticketPriorities: string[];
  ticketCategories: string[];
};

const TicketsPage = ({ tickets, ticketPriorities, ticketCategories }: TicketsPageProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('OTHER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleShowViewModal = (ticket: Ticket) => {
    setCurrentTicket(ticket);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description, priority, category }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create ticket');
      }

      setShowCreateModal(false);
      router.replace(router.asPath);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gestion des tickets</h1>
        <Button onClick={() => setShowCreateModal(true)} className="btn-primary">Ouvrir un ticket</Button>
      </div>

      <div className="table-responsive-wrapper">
        {tickets.length > 0 ? (
        <Table hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Sujet</th>
              <th>Status</th>
              <th>Priorité</th>
              <th>Catégorie</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={ticket.id}>
                <td>{index + 1}</td>
                <td>{ticket.subject}</td>
                <td>{ticketStatusTranslations[ticket.status]}</td>
                <td>{ticketPriorityTranslations[ticket.priority]}</td>
                <td>{ticketCategoryTranslations[ticket.category]}</td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" onClick={() => handleShowViewModal(ticket)} className="btn-primary">Voir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          Aucun ticket trouvé.
        </Alert>
      )}
      </div>

      {/* Create Ticket Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ouvrir un nouveau ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Sujet</Form.Label>
              <Form.Control type="text" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priorité</Form.Label>
              <Form.Select value={priority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value)} required>
                {ticketPriorities.map((p) => (
                  <option key={p} value={p}>{ticketPriorityTranslations[p]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Catégorie</Form.Label>
              <Form.Select value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)} required>
                {ticketCategories.map((c) => (
                  <option key={c} value={c}>{ticketCategoryTranslations[c]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button onClick={() => setShowCreateModal(false)} className="btn-secondary me-2">Annuler</Button>
              <Button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Envoi en cours...' : 'Envoyer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Ticket Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTicket && (
            <div>
              <h5>{currentTicket.subject}</h5>
              <p><strong>Status:</strong> {ticketStatusTranslations[currentTicket.status]}</p>
              <p><strong>Priorité:</strong> {ticketPriorityTranslations[currentTicket.priority]}</p>
              <p><strong>Catégorie:</strong> {ticketCategoryTranslations[currentTicket.category]}</p>
              <p><strong>Créé le:</strong> {new Date(currentTicket.createdAt).toLocaleString()}</p>
              <hr />
              <h6>Discussion</h6>
              <TicketMessages ticketId={currentTicket.id} />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
};


export const getServerSideProps = withAuth(async (context, session) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      agency: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return {
    props: {
      tickets: JSON.parse(JSON.stringify(tickets)),
      ticketPriorities: Object.values(TicketPriority),
      ticketCategories: Object.values(TicketCategory),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default TicketsPage;
