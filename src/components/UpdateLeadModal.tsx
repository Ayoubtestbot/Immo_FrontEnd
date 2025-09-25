import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Lead, User } from '@prisma/client';
import { LeadStatus } from '@prisma/client';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations'; // New import

type UpdateLeadModalProps = {
  show: boolean;
  handleClose: () => void;
  lead: (Lead & { assignedTo: User | null }) | null;
  agents: User[];
  onLeadUpdated: () => void;
};

const UpdateLeadModal = ({ show, handleClose, lead, agents, onLeadUpdated }: UpdateLeadModalProps) => {
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.NEW);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setAssignedToId(lead.assignedToId);
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/leads/${lead.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedToId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update lead');
      }

      setLoading(false);
      onLeadUpdated();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Mettre à jour le prospect</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Statut</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
              {Object.values(LeadStatus).map(s => (
                <option key={s} value={s}>{leadStatusTranslations[s]}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="assignedTo">
            <Form.Label>Assigner à</Form.Label>
            <Form.Select value={assignedToId || ''} onChange={(e) => setAssignedToId(e.target.value || null)}>
              <option value="">Non assigné</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button as="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button as="button" variant="primary" type="submit" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Sauvegarder'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateLeadModal;