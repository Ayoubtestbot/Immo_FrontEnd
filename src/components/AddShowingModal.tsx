import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { User } from '@prisma/client';

type AddShowingModalProps = {
  show: boolean;
  handleClose: () => void;
  propertyId: string;
  agents: User[];
  onShowingAdded: () => void;
};

const AddShowingModal = ({ show, handleClose, propertyId, agents, onShowingAdded }: AddShowingModalProps) => {
  const [agentId, setAgentId] = useState('');
  const [showingDate, setShowingDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agentId || !showingDate) {
      setError('Please select an agent and a date');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/showings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, agentId, showingDate }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create showing');
      }

      setLoading(false);
      onShowingAdded();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Showing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Agent</Form.Label>
            <Form.Select value={agentId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAgentId(e.target.value)} required>
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Showing Date</Form.Label>
            <Form.Control type="datetime-local" value={showingDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowingDate(e.target.value)} required />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Showing'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddShowingModal;
